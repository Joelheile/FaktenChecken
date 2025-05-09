# TikTok Truth Teller

A fact-checking application that analyzes TikTok videos and provides fact checking using OpenAI's ChatGPT.

## Features

- Extract transcripts from TikTok videos using Apify
- Analyze transcripts with ChatGPT to identify factual claims
- Get fact-checking evaluations of claims made in TikTok videos
- Ask follow-up questions about the video content

## Requirements

- Node.js 16+ and npm
- Apify API token (for TikTok transcript extraction)
- OpenAI API key (for fact-checking with ChatGPT)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tiktok-truth-teller.git
cd tiktok-truth-teller
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with your API keys:

```
VITE_APIFY_API_TOKEN=your_apify_token_here
VITE_OPENAI_API_KEY=your_openai_key_here
```

## Development

Start the development server:

```bash
npm run dev
```

## Building for Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## How it Works

1. The application takes a TikTok video URL as input
2. It sends the URL to Apify's TikTok Scraper API to extract the video transcript
3. The transcript is sent to OpenAI's ChatGPT for fact-checking
4. Results are displayed showing both the transcript and a factual analysis

## Architecture

- React/Vite frontend with Tailwind CSS for styling
- Apify client for extracting TikTok transcripts
- OpenAI API for fact-checking using ChatGPT
- Environment variables for API key management

## Technologies Used

- TypeScript
- React
- Vite
- Tailwind CSS
- Shadcn UI Components
- Apify Client API
- OpenAI API
