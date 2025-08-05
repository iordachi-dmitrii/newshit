# VideoVault - Production Deployment Guide

This guide covers deploying VideoVault with real video processing capabilities to production.

## Architecture Overview

```
Frontend (React/Vite) → Backend API (FastAPI) → yt-dlp → File Storage (S3/Local)
                     ↘ Redis (Job Tracking)
```

## Prerequisites

- Python 3.11+
- FFmpeg
- Redis (optional, fallback to in-memory)
- AWS S3 or compatible storage (optional, fallback to local)
- Docker (recommended)

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - CORS_ORIGINS=${FRONTEND_URL}
    volumes:
      - downloads_data:/app/downloads
    depends_on:
      - redis
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=${API_URL}
    depends_on:
      - api

volumes:
  downloads_data:
  redis_data:
```

#### Deploy Steps

```bash
# 1. Clone and setup
git clone <your-repo>
cd video-downloader

# 2. Configure environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env files with production values

# 3. Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Cloud Platform Deployment

#### Cloudflare Pages + Workers

**Frontend (Cloudflare Pages):**
```bash
# Build command
bun build

# Output directory
dist

# Environment variables
VITE_API_BASE_URL=https://your-api.yourdomain.com
```

**Backend (Cloudflare Workers or Railway/Render):**
- Deploy FastAPI backend to Railway, Render, or similar
- Configure Redis addon
- Set up R2 storage for files

#### Vercel + Railway

**Frontend (Vercel):**
```bash
# Build command
bun build

# Output directory
dist

# Environment variables
VITE_API_BASE_URL=https://your-api.railway.app
```

**Backend (Railway):**
```bash
# Deploy Python service
railway login
railway new
railway add redis
railway deploy
```

#### AWS Deployment

**Frontend (S3 + CloudFront):**
```bash
# Build and upload
bun build
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

**Backend (ECS + RDS):**
- Use ECS/Fargate for container deployment
- RDS for Redis (ElastiCache)
- S3 for file storage

### 3. VPS Deployment

```bash
# 1. Server setup (Ubuntu 22.04)
sudo apt update
sudo apt install python3.11 python3.11-venv ffmpeg redis-server nginx

# 2. Application setup
git clone <your-repo>
cd video-downloader
./setup.sh

# 3. Production setup
cd backend
source venv/bin/activate
pip install gunicorn

# 4. Create systemd service
sudo nano /etc/systemd/system/videovault-api.service
```

**Service file content:**
```ini
[Unit]
Description=VideoVault API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/video-downloader/backend
Environment=PATH=/path/to/video-downloader/backend/venv/bin
EnvironmentFile=/path/to/video-downloader/backend/.env
ExecStart=/path/to/video-downloader/backend/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Nginx configuration:**
```nginx
# /etc/nginx/sites-available/videovault
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/video-downloader/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Environment Configuration

### Backend (.env)
```env
# Required
REDIS_URL=redis://localhost:6379

# Optional but recommended for production
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=videovault-downloads
AWS_REGION=us-east-1

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Performance
MAX_FILE_SIZE=524288000  # 500MB
CLEANUP_AFTER_HOURS=24
API_WORKERS=4

# Monitoring
LOG_LEVEL=info
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=VideoVault
VITE_MAX_FILE_SIZE=500
```

## Security Considerations

### 1. Rate Limiting
```python
# Add to backend/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/download")
@limiter.limit("5/minute")  # Limit downloads
async def start_download(request: Request, ...):
    ...
```

### 2. Input Validation
```python
# Enhanced URL validation
ALLOWED_DOMAINS = [
    'youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com',
    'twitter.com', 'x.com', 'vimeo.com', 'facebook.com'
]

def validate_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return any(domain in parsed.netloc for domain in ALLOWED_DOMAINS)
    except:
        return False
```

### 3. File Size Limits
```python
# Enforce strict file size limits
MAX_DOWNLOAD_SIZE = 500 * 1024 * 1024  # 500MB
MAX_DURATION = 3600  # 1 hour

def validate_video_info(info: dict) -> bool:
    if info.get('filesize', 0) > MAX_DOWNLOAD_SIZE:
        return False
    if info.get('duration', 0) > MAX_DURATION:
        return False
    return True
```

## Monitoring & Analytics

### 1. Application Monitoring
```python
# Add to backend
import logging
from prometheus_client import Counter, Histogram
import time

# Metrics
download_requests = Counter('downloads_total', 'Total downloads')
download_duration = Histogram('download_duration_seconds', 'Download duration')

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 2. Error Tracking
```python
# Add Sentry integration
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[FastApiIntegration(auto_enabling_modules=True)],
    traces_sample_rate=1.0,
)
```

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancer (nginx, HAProxy, or cloud LB)
- Redis for shared session storage
- S3 or distributed storage for files

### 2. Background Jobs
```python
# Use Celery for heavy processing
from celery import Celery

celery_app = Celery(
    'videovault',
    broker='redis://localhost:6379',
    backend='redis://localhost:6379'
)

@celery_app.task
def process_video_download(url: str, format: str, quality: str):
    # Heavy processing in background
    pass
```

### 3. CDN Integration
- CloudFlare for frontend
- S3 + CloudFront for downloads
- Edge caching for static assets

## Backup & Recovery

### 1. Data Backup
```bash
# Redis backup
redis-cli BGSAVE

# File backup
aws s3 sync s3://videovault-downloads s3://videovault-backup
```

### 2. Database Migration
```bash
# Export Redis data
redis-cli --rdb dump.rdb

# Import to new instance
redis-cli --pipe < dump.rdb
```

## Performance Optimization

### 1. Caching Strategy
- Redis for API responses
- CDN for static assets
- Browser caching headers

### 2. Compression
```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 3. Database Optimization
- Connection pooling
- Query optimization
- Index optimization

## Legal Considerations

1. **Terms of Service**: Clearly state acceptable use
2. **Copyright Compliance**: Respect platform ToS
3. **DMCA Policy**: Implement takedown procedures
4. **Data Privacy**: GDPR/CCPA compliance
5. **Rate Limiting**: Respect platform limits

## Support & Maintenance

### 1. Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "dependencies": {
            "redis": check_redis_health(),
            "storage": check_storage_health()
        }
    }
```

### 2. Logging
```python
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("Request started", path=request.url.path)
    response = await call_next(request)
    logger.info("Request completed", status=response.status_code)
    return response
```

This deployment guide provides a comprehensive overview of deploying VideoVault to production with real video processing capabilities.