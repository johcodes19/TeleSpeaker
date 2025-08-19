# TeleSpeaker
This is a Professional TTS app for actors and content creators, where you paste your script and can perform it in real time with no need to memorize.

## ✨ Features

### Three Operating Modes

1. **Browser TTS** - Uses built-in browser speech synthesis
2. **Manual Timer** - Visual countdown for practicing without audio  
3. **External APIs** - Professional TTS services integration

### Supported TTS Services

- **ElevenLabs** - Most realistic AI voices (10,000 free chars/month)
- **OpenAI TTS** - High-quality neural voices
- **Google Cloud** - WaveNet technology
- **Azure Speech** - Microsoft cognitive services

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Choose your preferred mode
3. Enter your script (one line per speaking part)
4. Configure settings (voice, speed, pause duration)
5. Click Start to begin practicing

## 🔧 Setup for External APIs

### ElevenLabs
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the dashboard
3. Enter the key in the app

### OpenAI
1. Create account at [platform.openai.com](https://platform.openai.com)
2. Generate API key
3. Add credits to your account

### Google Cloud TTS
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Text-to-Speech API
3. Create credentials

### Azure Speech
1. Sign up for [Azure](https://azure.microsoft.com)
2. Create Speech resource
3. Get your key and region

## 💡 Use Cases

- **Actors** - Memorize lines for auditions and performances
- **Content Creators** - Practice scripts for videos and podcasts
- **Presenters** - Rehearse speeches and presentations
- **Language Learners** - Improve pronunciation and fluency

## ⚠️ Important Notes

### CORS Issues
Direct API calls from browsers may be blocked. Solutions:
- Deploy to a web server with proper headers
- Use a backend proxy server
- Install CORS browser extension for testing

### API Security
For production use:
- Never expose API keys in client-side code
- Implement backend server for API calls
- Use environment variables for keys

## 📝 License

MIT License - feel free to use and modify

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss changes.

## 📧 Support

For issues and questions, please open a GitHub issue.
