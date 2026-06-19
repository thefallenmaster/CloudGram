# CloudGram ☁️

CloudGram is a premium, limitless image hosting service powered by the Telegram Bot API. It provides a beautiful, secure, and fast way to upload images and generate shareable links or embed codes.

## Features ✨

- **Drag & Drop Uploads**: Seamlessly upload images by dragging and dropping them into the beautiful glassmorphism UI.
- **Fast Image Hosting**: Images are hosted on Telegram's robust servers and proxied back instantly.
- **Auto-Generated URLs**: Get direct links to your uploaded images instantly.
- **HTML Embed Code**: Copy a ready-to-use `<img />` tag to embed the image anywhere on the web.
- **API Support**: Integrate image uploading directly into your own apps with a robust REST API.

## Demo 🎥

Here is a look at the UI and workflow:

![Upload Demo](/Users/gauthambala/.gemini/antigravity-ide/brain/99e82c78-d26a-4098-a9fc-2150d702f846/demo_new_1781853769451.webp)

*(Note: The animation above is a WebP video captured showing the CloudGram interface)*

## API Integration 💻

You can also use our API directly. The API accepts a `multipart/form-data` request with an `image` field.

### Endpoint Details
- **URL:** `/api/upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

### cURL Example
```bash
curl -X POST https://cloudgram-ashy.vercel.app/api/upload \
  -F "image=@/path/to/your/image.png"
```

### JavaScript Fetch Example
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://cloudgram-ashy.vercel.app/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    console.log('Image URL:', data.url);
  }
};
```

### Response Format

**Success (200)**
```json
{
  "success": true,
  "fileId": "AgACAgUAAxkBAAE...",
  "url": "https://cloudgram-ashy.vercel.app/api/image/AgACAgUAAxkBAAE..."
}
```

**Error (400 / 500)**
```json
{
  "error": "No image uploaded"
}
```
