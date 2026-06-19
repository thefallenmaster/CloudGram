const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', upload.single('image'), async (req, res) => {
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

module.exports = router;
