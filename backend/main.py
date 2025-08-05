# VideoVault Backend - Real Video Processing with yt-dlp
# FastAPI backend for handling video downloads

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import yt_dlp
import uuid
import asyncio
import os
import json
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timedelta
import redis
import boto3
from botocore.exceptions import NoCredentialsError

app = FastAPI(title="VideoVault API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DOWNLOAD_DIR = Path("downloads")
DOWNLOAD_DIR.mkdir(exist_ok=True)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "videovault-downloads")
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB limit
CLEANUP_AFTER_HOURS = 24

# Initialize Redis for job tracking
try:
    redis_client = redis.from_url(REDIS_URL)
except:
    redis_client = None
    print("Warning: Redis not available, using in-memory storage")

# Initialize S3 client
try:
    s3_client = boto3.client('s3')
except NoCredentialsError:
    s3_client = None
    print("Warning: AWS credentials not configured")

# In-memory storage fallback
download_jobs: Dict[str, Dict] = {}

# Models
class VideoInfoRequest(BaseModel):
    url: HttpUrl

class DownloadRequest(BaseModel):
    url: HttpUrl
    format: str = "mp4"
    quality: str = "720p"

class VideoInfo(BaseModel):
    id: str
    title: str
    description: Optional[str]
    duration: Optional[int]
    uploader: Optional[str]
    upload_date: Optional[str]
    view_count: Optional[int]
    thumbnail: Optional[str]
    formats: List[Dict[str, Any]]
    platform: str

class DownloadStatus(BaseModel):
    id: str
    status: str  # queued, processing, completed, error, expired
    progress: float
    title: Optional[str]
    file_size: Optional[int]
    download_url: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    expires_at: Optional[datetime]

# yt-dlp configuration
def get_ydl_opts(format_selector: str = "best", output_path: str = None):
    """Get yt-dlp options based on format and quality requirements"""
    
    base_opts = {
        'format': format_selector,
        'outtmpl': output_path or str(DOWNLOAD_DIR / '%(id)s.%(ext)s'),
        'writesubtitles': False,
        'writeautomaticsub': False,
        'writeinfojson': True,
        'writethumbnail': False,
        'ignoreerrors': False,
        'no_warnings': False,
        'extractflat': False,
        'socket_timeout': 30,
        'retries': 3,
    }
    
    return base_opts

def get_format_selector(format_type: str, quality: str) -> str:
    """Generate format selector for yt-dlp based on user preferences"""
    
    if format_type == "mp3":
        return "bestaudio/best"
    
    quality_map = {
        "1080p": "best[height<=1080]",
        "720p": "best[height<=720]", 
        "480p": "best[height<=480]",
        "360p": "best[height<=360]",
        "best": "best",
        "worst": "worst"
    }
    
    return quality_map.get(quality, "best[height<=720]")

def store_job_status(job_id: str, status: DownloadStatus):
    """Store job status in Redis or in-memory fallback"""
    status_dict = status.dict()
    status_dict['created_at'] = status.created_at.isoformat()
    if status.completed_at:
        status_dict['completed_at'] = status.completed_at.isoformat()
    if status.expires_at:
        status_dict['expires_at'] = status.expires_at.isoformat()
    
    if redis_client:
        redis_client.setex(f"job:{job_id}", 86400, json.dumps(status_dict))  # 24 hour expiry
    else:
        download_jobs[job_id] = status_dict

def get_job_status(job_id: str) -> Optional[DownloadStatus]:
    """Retrieve job status from Redis or in-memory fallback"""
    try:
        if redis_client:
            data = redis_client.get(f"job:{job_id}")
            if data:
                status_dict = json.loads(data)
            else:
                return None
        else:
            status_dict = download_jobs.get(job_id)
            if not status_dict:
                return None
        
        # Parse datetime fields
        status_dict['created_at'] = datetime.fromisoformat(status_dict['created_at'])
        if status_dict.get('completed_at'):
            status_dict['completed_at'] = datetime.fromisoformat(status_dict['completed_at'])
        if status_dict.get('expires_at'):
            status_dict['expires_at'] = datetime.fromisoformat(status_dict['expires_at'])
            
        return DownloadStatus(**status_dict)
    except Exception as e:
        print(f"Error retrieving job status: {e}")
        return None

class ProgressHook:
    """Progress hook for yt-dlp to track download progress"""
    def __init__(self, job_id: str):
        self.job_id = job_id
        
    def __call__(self, d):
        if d['status'] == 'downloading':
            try:
                if 'total_bytes' in d and d['total_bytes']:
                    progress = (d['downloaded_bytes'] / d['total_bytes']) * 100
                elif '_percent_str' in d:
                    progress = float(d['_percent_str'].replace('%', ''))
                else:
                    progress = 0
                
                # Update job status
                job_status = get_job_status(self.job_id)
                if job_status:
                    job_status.progress = min(progress, 99)  # Cap at 99% until complete
                    job_status.status = "processing"
                    store_job_status(self.job_id, job_status)
                    
            except Exception as e:
                print(f"Progress hook error: {e}")
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "redis_connected": redis_client is not None,
        "s3_configured": s3_client is not None
    }

@app.post("/api/video-info", response_model=VideoInfo)
async def get_video_info(request: VideoInfoRequest):
    """Extract video information without downloading"""
    
    try:
        url = str(request.url)
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Extract relevant information
            video_info = VideoInfo(
                id=info.get('id', 'unknown'),
                title=info.get('title', 'Unknown Title'),
                description=info.get('description', ''),
                duration=info.get('duration'),
                uploader=info.get('uploader'),
                upload_date=info.get('upload_date'),
                view_count=info.get('view_count'),
                thumbnail=info.get('thumbnail'),
                formats=[
                    {
                        'format_id': f.get('format_id'),
                        'ext': f.get('ext'),
                        'quality': f.get('format_note', ''),
                        'filesize': f.get('filesize'),
                        'height': f.get('height'),
                        'width': f.get('width'),
                        'vcodec': f.get('vcodec'),
                        'acodec': f.get('acodec'),
                    }
                    for f in info.get('formats', [])
                    if f.get('ext') in ['mp4', 'webm', 'mkv', 'm4a', 'mp3']
                ],
                platform=info.get('extractor_key', 'Unknown')
            )
            
            return video_info
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting video info: {str(e)}")

@app.post("/api/download")
async def start_download(request: DownloadRequest, background_tasks: BackgroundTasks):
    """Start video download process"""
    
    job_id = str(uuid.uuid4())
    
    # Create initial job status
    status = DownloadStatus(
        id=job_id,
        status="queued",
        progress=0.0,
        created_at=datetime.now(),
        expires_at=datetime.now() + timedelta(hours=CLEANUP_AFTER_HOURS)
    )
    
    store_job_status(job_id, status)
    
    # Add download task to background
    background_tasks.add_task(process_download, job_id, str(request.url), request.format, request.quality)
    
    return {"job_id": job_id, "status": status.dict()}

async def process_download(job_id: str, url: str, format_type: str, quality: str):
    """Background task to process video download"""
    
    try:
        # Update status to processing
        status = get_job_status(job_id)
        if not status:
            return
            
        status.status = "processing"
        status.progress = 1.0
        store_job_status(job_id, status)
        
        # Prepare download path
        output_dir = DOWNLOAD_DIR / job_id
        output_dir.mkdir(exist_ok=True)
        
        # Configure yt-dlp options
        format_selector = get_format_selector(format_type, quality)
        output_template = str(output_dir / f"%(title)s.%(ext)s")
        
        ydl_opts = get_ydl_opts(format_selector, output_template)
        ydl_opts['progress_hooks'] = [ProgressHook(job_id)]
        
        # Handle audio extraction for mp3
        if format_type == "mp3":
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            })
        
        # Download the video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
            # Find the downloaded file
            downloaded_files = list(output_dir.glob("*"))
            video_file = None
            
            for file_path in downloaded_files:
                if file_path.suffix in ['.mp4', '.webm', '.mkv', '.mp3', '.m4a'] and not file_path.name.endswith('.info.json'):
                    video_file = file_path
                    break
            
            if not video_file or not video_file.exists():
                raise Exception("Downloaded file not found")
            
            # Check file size
            file_size = video_file.stat().st_size
            if file_size > MAX_FILE_SIZE:
                video_file.unlink()  # Delete the file
                raise Exception(f"File too large ({file_size / 1024 / 1024:.1f}MB). Maximum allowed: {MAX_FILE_SIZE / 1024 / 1024}MB")
            
            # Upload to S3 if configured, otherwise keep local
            download_url = None
            if s3_client:
                try:
                    s3_key = f"downloads/{job_id}/{video_file.name}"
                    s3_client.upload_file(str(video_file), AWS_BUCKET_NAME, s3_key)
                    download_url = f"https://{AWS_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
                except Exception as e:
                    print(f"S3 upload failed: {e}")
                    download_url = f"/api/download/{job_id}/file"
            else:
                download_url = f"/api/download/{job_id}/file"
            
            # Update final status
            status.status = "completed"
            status.progress = 100.0
            status.title = info.get('title', 'Downloaded Video')
            status.file_size = file_size
            status.download_url = download_url
            status.completed_at = datetime.now()
            
            store_job_status(job_id, status)
            
    except Exception as e:
        # Update status with error
        status = get_job_status(job_id)
        if status:
            status.status = "error"
            status.error_message = str(e)
            store_job_status(job_id, status)
        
        print(f"Download error for job {job_id}: {e}")

@app.get("/api/download/{job_id}/status", response_model=DownloadStatus)
async def get_download_status(job_id: str):
    """Get download job status"""
    
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if expired
    if status.expires_at and datetime.now() > status.expires_at:
        status.status = "expired"
        store_job_status(job_id, status)
    
    return status

@app.get("/api/download/{job_id}/file")
async def download_file(job_id: str):
    """Download the processed video file"""
    
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if status.status != "completed":
        raise HTTPException(status_code=400, detail="Download not completed")
    
    if status.expires_at and datetime.now() > status.expires_at:
        raise HTTPException(status_code=410, detail="Download expired")
    
    # Find the file
    output_dir = DOWNLOAD_DIR / job_id
    downloaded_files = list(output_dir.glob("*"))
    
    video_file = None
    for file_path in downloaded_files:
        if file_path.suffix in ['.mp4', '.webm', '.mkv', '.mp3', '.m4a'] and not file_path.name.endswith('.info.json'):
            video_file = file_path
            break
    
    if not video_file or not video_file.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(video_file),
        filename=video_file.name,
        media_type='application/octet-stream'
    )

@app.delete("/api/download/{job_id}")
async def cleanup_download(job_id: str):
    """Cleanup download files and job data"""
    
    # Remove from storage
    if redis_client:
        redis_client.delete(f"job:{job_id}")
    else:
        download_jobs.pop(job_id, None)
    
    # Remove local files
    output_dir = DOWNLOAD_DIR / job_id
    if output_dir.exists():
        shutil.rmtree(output_dir)
    
    return {"message": "Download cleaned up successfully"}

@app.get("/api/supported-platforms")
async def get_supported_platforms():
    """Get list of supported platforms from yt-dlp"""
    
    # Get extractors from yt-dlp
    extractors = yt_dlp.list_extractors()
    
    # Filter to major platforms
    major_platforms = [
        'youtube', 'tiktok', 'instagram', 'twitter', 'vimeo', 
        'facebook', 'twitch', 'dailymotion', 'soundcloud', 'reddit'
    ]
    
    supported = []
    for extractor in extractors:
        extractor_name = extractor.lower()
        for platform in major_platforms:
            if platform in extractor_name:
                supported.append({
                    'name': platform.title(),
                    'extractor': extractor,
                    'supported_formats': ['mp4', 'mp3'] if platform != 'soundcloud' else ['mp3']
                })
                break
    
    return {"platforms": supported}

# Cleanup task to remove expired downloads
@app.on_event("startup")
async def cleanup_expired_downloads():
    """Periodic cleanup of expired downloads"""
    
    async def cleanup_task():
        while True:
            try:
                # Clean up local files older than CLEANUP_AFTER_HOURS
                cutoff_time = datetime.now() - timedelta(hours=CLEANUP_AFTER_HOURS)
                
                for job_dir in DOWNLOAD_DIR.iterdir():
                    if job_dir.is_dir():
                        # Check if directory is old enough
                        created_time = datetime.fromtimestamp(job_dir.stat().st_ctime)
                        if created_time < cutoff_time:
                            shutil.rmtree(job_dir)
                            print(f"Cleaned up expired download: {job_dir}")
                
                await asyncio.sleep(3600)  # Run every hour
                
            except Exception as e:
                print(f"Cleanup task error: {e}")
                await asyncio.sleep(3600)
    
    asyncio.create_task(cleanup_task())

# Health check endpoint for monitoring
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "redis": "connected" if redis_client else "disabled",
        "s3": "connected" if s3_client else "disabled"
    }

# Serve static files (frontend)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

# Mount static files
static_dir = Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    # Serve index.html for SPA routing
    @app.get("/", response_class=HTMLResponse)
    async def serve_frontend():
        """Serve the frontend application"""
        index_file = static_dir / "index.html"
        if index_file.exists():
            return HTMLResponse(content=index_file.read_text(), status_code=200)
        return HTMLResponse(content="<h1>VideoVault API is running!</h1><p>Upload your frontend to /static directory</p>", status_code=200)
    
    # Catch-all route for SPA
    @app.get("/{path:path}", response_class=HTMLResponse)
    async def serve_spa(path: str):
        """Serve SPA for client-side routing"""
        # Don't serve SPA for API routes
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        index_file = static_dir / "index.html"
        if index_file.exists():
            return HTMLResponse(content=index_file.read_text(), status_code=200)
        raise HTTPException(status_code=404, detail="Frontend not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
