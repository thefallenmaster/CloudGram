# ☁️ CloudGram

**A sleek, serverless-ready image hosting platform powered by Telegram.**

CloudGram ingeniously uses Telegram's infrastructure as an unlimited cloud storage backend for your images. Paired with a modern, glassmorphism-inspired UI, it provides a seamless drag-and-drop experience for uploading and sharing images instantly.

## ✨ Features

- **Unlimited Storage**: Leverages Telegram bots to store images without traditional cloud storage limits.
- **Beautiful UI**: Modern dark mode with a dynamic glassmorphism design and micro-animations.
- **Drag & Drop**: Seamlessly drag and drop images or browse files to upload.
- **Smart Proxying**: Images are streamed and cached directly through the backend, keeping your Telegram bot token secure.
- **Vercel Ready**: Pre-configured for one-click serverless deployment on Vercel.
- **Custom Fallbacks**: Graceful error handling with custom 404 pages for deleted or missing media.

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML, CSS3 (Glassmorphism), JavaScript
- **Backend**: Node.js, Express.js
- **Storage/API**: Telegram Bot API, Axios, Multer

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- A Telegram Chat/Channel ID

### 2. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_target_chat_or_channel_id
```

### 4. Run Locally

Start the development server:

```bash
node server.js
```
Navigate to `http://localhost:3000` to access the application.

## 📦 Deployment

CloudGram is optimized for Vercel. Simply push your code to a Git repository and import the project into Vercel. Ensure you add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to your Environment Variables in the Vercel project settings.

---
*Built with simplicity and aesthetics in mind.*
