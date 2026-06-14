require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({ error: 'Server configuration error: Telegram credentials missing' });
        }

        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('photo', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
        const response = await axios.post(telegramApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        if (response.data && response.data.ok) {
            // Get the file_id of the highest resolution photo
            const photos = response.data.result.photo;
            const fileId = photos[photos.length - 1].file_id;
            
            // Return URL that our server will proxy
            const imageUrl = `${req.protocol}://${req.get('host')}/api/image/${fileId}`;
            res.json({ success: true, fileId, url: imageUrl });
        } else {
            console.error('Telegram API error:', response.data);
            res.status(500).json({ error: 'Failed to upload to Telegram' });
        }
    } catch (error) {
        console.error('Error uploading image:', error.message);
        if (error.response) {
            console.error('Telegram response data:', error.response.data);
        }
        res.status(500).json({ error: 'Internal server error during upload' });
    }
});

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
