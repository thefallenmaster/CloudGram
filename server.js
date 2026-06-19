require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Import and use upload route
const uploadRoute = require('./routes/upload');
app.use('/api', uploadRoute);

// Image retrieval proxy endpoint
app.get('/api/image/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!BOT_TOKEN) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // 1. Get file path from Telegram
        const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
        const fileResponse = await axios.get(getFileUrl, {
            validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
            }
        });

        if (!fileResponse.data || !fileResponse.data.ok) {
            return res.status(404).sendFile(path.join(__dirname, 'public', 'error.html'));
        }

        const filePath = fileResponse.data.result.file_path;

        // 2. Fetch the actual file and stream to client
        const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
        
        const imageStream = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
        });

        // Set proper content type based on the extension from telegram if available, or fallback
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'image/jpeg'; // default
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.webp') contentType = 'image/webp';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for a year

        imageStream.data.pipe(res);
    } catch (error) {
        console.error('Error proxying image:', error.message);
        res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
    }
});

// Fallback to index.html for frontend routing if needed
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
