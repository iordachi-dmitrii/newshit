// Video Downloader API - Backend endpoints
// This runs on Cloudflare Workers at the edge

// Types for video downloader
interface VideoInfo {
  id: string;
  url: string;
  title: string;
  platform: string;
  duration: number;
  thumbnail: string;
  availableFormats: VideoFormat[];
  uploadDate: string;
  viewCount?: number;
  author?: string;
}

interface VideoFormat {
  quality: string;
  format: string;
  fileSize: string;
  downloadUrl: string;
}

interface DownloadRequest {
  url: string;
  format: string;
  quality: string;
}

interface DownloadStatus {
  id: string;
  status: 'processing' | 'completed' | 'error' | 'queued';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// Platform detection utilities
const platformPatterns = {
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  tiktok: /tiktok\.com\/@[^/]+\/video\/(\d+)/,
  instagram: /instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/,
  twitter: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
  vimeo: /vimeo\.com\/(\d+)/,
  facebook: /facebook\.com\/.*\/videos\/(\d+)/,
  twitch: /twitch\.tv\/videos\/(\d+)/,
};

// Mock video data - in production, you'd fetch this from video APIs
const mockVideoInfo: Record<string, VideoInfo> = {
  'youtube_example': {
    id: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Video)',
    platform: 'YouTube',
    duration: 212,
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    availableFormats: [
      { quality: '1080p', format: 'mp4', fileSize: '45.2 MB', downloadUrl: '/download/1' },
      { quality: '720p', format: 'mp4', fileSize: '28.1 MB', downloadUrl: '/download/2' },
      { quality: '480p', format: 'mp4', fileSize: '18.3 MB', downloadUrl: '/download/3' },
      { quality: '360p', format: 'mp4', fileSize: '12.7 MB', downloadUrl: '/download/4' },
      { quality: 'audio', format: 'mp3', fileSize: '5.1 MB', downloadUrl: '/download/5' },
    ],
    uploadDate: '2009-10-25',
    viewCount: 1400000000,
    author: 'Rick Astley'
  }
};

// Mock download statuses
const downloadStatuses: Record<string, DownloadStatus> = {};

// Helper functions
function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

function detectPlatform(url: string): string {
  for (const [platform, pattern] of Object.entries(platformPatterns)) {
    if (pattern.test(url)) {
      return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  }
  return 'Unknown';
}

function extractVideoId(url: string): string | null {
  for (const pattern of Object.values(platformPatterns)) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function generateDownloadId(): string {
  return 'dl_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Main worker handler
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get("Origin") || "*";
    
    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    
    // Router - match paths and methods
    try {
      // GET /api/health - Health check endpoint
      if (url.pathname === "/api/health" && method === "GET") {
        return Response.json(
          { 
            status: "healthy", 
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            service: "VideoVault API"
          },
          { headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/video-info - Get video information from URL
      if (url.pathname === "/api/video-info" && method === "POST") {
        const body = await request.json() as { url: string };
        
        if (!body.url) {
          return Response.json(
            { error: "URL is required" },
            { status: 400, headers: corsHeaders(origin) }
          );
        }
        
        const platform = detectPlatform(body.url);
        const videoId = extractVideoId(body.url);
        
        if (platform === 'Unknown' || !videoId) {
          return Response.json(
            { error: "Unsupported platform or invalid URL" },
            { status: 400, headers: corsHeaders(origin) }
          );
        }
        
        // In production, you'd fetch real video info from platform APIs
        const videoInfo: VideoInfo = {
          id: videoId,
          url: body.url,
          title: `Sample Video from ${platform}`,
          platform,
          duration: Math.floor(Math.random() * 600) + 60, // Random duration 1-10 minutes
          thumbnail: `https://picsum.photos/640/360?random=${videoId}`,
          availableFormats: [
            { quality: '1080p', format: 'mp4', fileSize: `${Math.floor(Math.random() * 50) + 30} MB`, downloadUrl: `/download/${videoId}_1080p` },
            { quality: '720p', format: 'mp4', fileSize: `${Math.floor(Math.random() * 30) + 20} MB`, downloadUrl: `/download/${videoId}_720p` },
            { quality: '480p', format: 'mp4', fileSize: `${Math.floor(Math.random() * 20) + 10} MB`, downloadUrl: `/download/${videoId}_480p` },
            { quality: '360p', format: 'mp4', fileSize: `${Math.floor(Math.random() * 15) + 5} MB`, downloadUrl: `/download/${videoId}_360p` },
            { quality: 'audio', format: 'mp3', fileSize: `${Math.floor(Math.random() * 8) + 3} MB`, downloadUrl: `/download/${videoId}_audio` },
          ],
          uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          viewCount: Math.floor(Math.random() * 10000000),
          author: `Creator ${Math.floor(Math.random() * 1000)}`
        };
        
        return Response.json(
          { videoInfo },
          { headers: corsHeaders(origin) }
        );
      }
      
      // POST /api/download - Start video download
      if (url.pathname === "/api/download" && method === "POST") {
        const body = await request.json() as DownloadRequest;
        
        if (!body.url || !body.format || !body.quality) {
          return Response.json(
            { error: "URL, format, and quality are required" },
            { status: 400, headers: corsHeaders(origin) }
          );
        }
        
        const platform = detectPlatform(body.url);
        if (platform === 'Unknown') {
          return Response.json(
            { error: "Unsupported platform" },
            { status: 400, headers: corsHeaders(origin) }
          );
        }
        
        const downloadId = generateDownloadId();
        const downloadStatus: DownloadStatus = {
          id: downloadId,
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString()
        };
        
        downloadStatuses[downloadId] = downloadStatus;
        
        // Simulate processing
        setTimeout(() => {
          if (downloadStatuses[downloadId]) {
            downloadStatuses[downloadId].status = 'processing';
            downloadStatuses[downloadId].progress = 25;
          }
        }, 1000);
        
        setTimeout(() => {
          if (downloadStatuses[downloadId]) {
            downloadStatuses[downloadId].status = 'processing';
            downloadStatuses[downloadId].progress = 75;
          }
        }, 2000);
        
        setTimeout(() => {
          if (downloadStatuses[downloadId]) {
            downloadStatuses[downloadId].status = 'completed';
            downloadStatuses[downloadId].progress = 100;
            downloadStatuses[downloadId].completedAt = new Date().toISOString();
            downloadStatuses[downloadId].downloadUrl = `/files/${downloadId}.${body.format}`;
          }
        }, 3000);
        
        return Response.json(
          { downloadId, status: downloadStatus },
          { headers: corsHeaders(origin) }
        );
      }
      
      // GET /api/download/:id - Check download status
      const downloadMatch = url.pathname.match(/^\/api\/download\/([a-zA-Z0-9_]+)$/);
      if (downloadMatch && method === "GET") {
        const downloadId = downloadMatch[1];
        const status = downloadStatuses[downloadId];
        
        if (!status) {
          return Response.json(
            { error: "Download not found" },
            { status: 404, headers: corsHeaders(origin) }
          );
        }
        
        return Response.json(
          { status },
          { headers: corsHeaders(origin) }
        );
      }
      
      // GET /api/supported-platforms - List supported platforms
      if (url.pathname === "/api/supported-platforms" && method === "GET") {
        const platforms = Object.keys(platformPatterns).map(platform => ({
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          pattern: platformPatterns[platform as keyof typeof platformPatterns].source,
          example: getExampleUrl(platform)
        }));
        
        return Response.json(
          { platforms },
          { headers: corsHeaders(origin) }
        );
      }
      
      // 404 for unmatched routes
      return Response.json(
        { error: "Not Found", path: url.pathname },
        { status: 404, headers: corsHeaders(origin) }
      );
      
    } catch (error) {
      console.error("API Error:", error);
      return Response.json(
        { error: "Internal Server Error" },
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  }
};

// Helper function to get example URLs for platforms
function getExampleUrl(platform: string): string {
  const examples: Record<string, string> = {
    youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tiktok: 'https://www.tiktok.com/@user/video/1234567890',
    instagram: 'https://www.instagram.com/p/ABC123/',
    twitter: 'https://twitter.com/user/status/1234567890',
    vimeo: 'https://vimeo.com/123456789',
    facebook: 'https://www.facebook.com/user/videos/1234567890',
    twitch: 'https://www.twitch.tv/videos/1234567890'
  };
  return examples[platform] || '';
}

// Environment bindings interface for production
// interface Env {
//   DB: D1Database;           // For SQL database
//   KV: KVNamespace;          // For key-value storage
//   BUCKET: R2Bucket;         // For file storage
//   API_KEY: string;          // For secrets
//   YOUTUBE_API_KEY: string;  // YouTube API key
//   TIKTOK_API_KEY: string;   // TikTok API key
// } 