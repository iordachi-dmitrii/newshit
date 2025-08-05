# VideoVault - All-in-One Video Downloader

🎬 A modern, fast, and secure video downloader supporting multiple platforms including YouTube, TikTok, Instagram, Twitter, and more.

## ✨ Features

- **🚀 Real Video Processing**: Powered by yt-dlp for actual video downloads
- **🌐 Multiple Platform Support**: YouTube, TikTok, Instagram, Twitter, Vimeo, Facebook, Twitch, Dailymotion, and more
- **🎯 Multiple Formats**: Support for MP4, MP3, AVI, MOV formats
- **📱 Quality Options**: Choose from 360p to 1080p video quality
- **⚡ Lightning Fast**: Optimized download servers with real-time progress tracking
- **🔒 Secure & Private**: No personal data storage, secure processing
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Clean, intuitive interface with dark/light mode
- **📊 Download Management**: Track downloads with real-time status updates
- **🔧 Production Ready**: Full backend API with Redis caching and S3 storage
- **🐳 Docker Support**: Easy deployment with Docker Compose

## 🚀 Live Demo

Try VideoVault live at: [Your deployment URL]

## 🛠️ Tech Stack

### Frontend
- **React 19** + TypeScript + Vite 6
- **Tailwind CSS V4** with custom gradients and themes
- **shadcn/ui** + Lucide Icons for polished UI
- **Bun** for fast package management

### Backend 
- **FastAPI** (Python) for high-performance API
- **yt-dlp** for real video processing
- **Redis** for job tracking and caching
- **AWS S3** or local storage for files
- **Docker** for containerized deployment

## 📋 Supported Platforms

| Platform | Status | Formats | Quality | Real Processing |
|----------|--------|---------|---------|----------------|
| YouTube | ✅ | MP4, MP3 | 360p-1080p | ✅ |
| TikTok | ✅ | MP4, MP3 | 720p, 480p | ✅ |
| Instagram | ✅ | MP4, MP3 | 720p, 480p | ✅ |
| Twitter/X | ✅ | MP4, MP3 | 720p, 480p | ✅ |
| Vimeo | ✅ | MP4, MP3 | 360p-1080p | ✅ |
| Facebook | ✅ | MP4, MP3 | 720p, 480p | ✅ |
| Twitch | ✅ | MP4, MP3 | 720p, 480p | ✅ |
| Dailymotion | ✅ | MP4, MP3 | 360p-720p | ✅ |
| SoundCloud | ✅ | MP3 | Audio only | ✅ |
| Reddit | ✅ | MP4, MP3 | Variable | ✅ |

## 🏁 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd video-downloader

# Setup environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Start all services
docker-compose up
```

### Option 2: Manual Setup

**Prerequisites:**
- Python 3.11+
- Node.js 18+ (or Bun)
- FFmpeg
- Redis (optional)

```bash
# Run setup script
./setup.sh          # Linux/Mac
# or
setup.bat           # Windows

# Manual setup if needed:
# 1. Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env

# 2. Frontend  
cd ..
bun install  # or npm install
cp .env.example .env
```

**Start Development:**
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2: Frontend
bun dev  # or npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔧 API Endpoints

The backend provides a comprehensive REST API:

### Video Information
```http
POST /api/video-info
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=example"
}
```

### Start Download
```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=example",
  "format": "mp4",
  "quality": "720p"
}
```

### Check Download Status
```http
GET /api/download/{job_id}/status
```

### Download File
```http
GET /api/download/{job_id}/file
```

### Supported Platforms
```http
GET /api/supported-platforms
```

**📖 Full API documentation available at `/docs` when backend is running**

## 🎯 Usage

### Basic Download Process

1. **Paste Video URL**: Copy any video URL from supported platforms
2. **Automatic Detection**: Platform and video info detected automatically  
3. **Select Options**: Choose format (MP4/MP3) and quality (360p-1080p)
4. **Real-time Processing**: Watch progress with live status updates
5. **Download File**: Get your processed file when complete

### Advanced Features

- **Batch Downloads**: Queue multiple videos
- **Format Conversion**: Automatic audio extraction for MP3
- **Quality Selection**: Adaptive quality based on source
- **Progress Tracking**: Real-time download progress
- **Error Recovery**: Automatic retry on failures
- **File Management**: Automatic cleanup after 24 hours

## 🚀 Deployment

### Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for comprehensive deployment guide including:

- Docker deployment
- Cloud platform setup (AWS, Railway, Vercel)
- VPS deployment
- Security configuration
- Monitoring and scaling

### Quick Production Setup

**Docker (Recommended):**
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

**Environment Variables:**
```env
# Backend
REDIS_URL=redis://redis:6379
AWS_BUCKET_NAME=your-bucket
CORS_ORIGINS=https://yourdomain.com

# Frontend  
VITE_API_BASE_URL=https://api.yourdomain.com
```

## ⚙️ Configuration

### Backend Configuration (backend/.env)
```env
# Required
REDIS_URL=redis://localhost:6379

# Optional - File Storage (S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=videovault-downloads
AWS_REGION=us-east-1

# Performance
MAX_FILE_SIZE=524288000  # 500MB
CLEANUP_AFTER_HOURS=24
API_WORKERS=2

# Security
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Frontend Configuration (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=VideoVault
VITE_MAX_FILE_SIZE=500
```

### Docker Configuration

See `docker-compose.yml` for development and `docker-compose.prod.yml` for production deployment configurations.

## 🔒 Security & Privacy

- ✅ **No data collection** - Videos processed temporarily only
- ✅ **Secure processing** - All downloads processed server-side
- ✅ **Auto-cleanup** - Files automatically deleted after 24 hours
- ✅ **Input validation** - Strict URL and file size validation
- ✅ **Rate limiting** - Built-in abuse prevention
- ✅ **CORS protection** - Configurable origin restrictions
- ✅ **Error handling** - Graceful error recovery

### Production Security Features

- Rate limiting (5 downloads/minute per IP)
- File size limits (500MB max)
- URL validation against allowed domains
- Automatic malware scanning (when S3 configured)
- Redis-based session management
- Comprehensive logging and monitoring

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Troubleshooting](#-troubleshooting) section above**
2. **Review [DEPLOYMENT.md](DEPLOYMENT.md) for production issues**
3. **Search existing GitHub issues**
4. **Create a new issue with:**
   - Your environment (OS, Python/Node versions)
   - Error logs and steps to reproduce
   - Expected vs actual behavior

### Performance Issues

- Check Redis connection and memory usage
- Monitor disk space for downloads directory
- Verify FFmpeg is properly installed
- Consider scaling backend workers

### Security Concerns

Please report security vulnerabilities privately to the maintainers.

## 🙏 Acknowledgments

- Built with ❤️ using Scout
- UI components by shadcn/ui
- Icons by Lucide
- Powered by Cloudflare Workers

---

**VideoVault** - Download videos from anywhere, anytime. Fast, free, and secure.

**🎬 Real video processing powered by yt-dlp | 🚀 Modern React interface | 🐳 Docker ready**