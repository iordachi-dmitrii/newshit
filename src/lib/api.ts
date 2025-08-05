// VideoVault API Client - Real Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types matching backend models
export interface VideoInfo {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  uploader?: string;
  upload_date?: string;
  view_count?: number;
  thumbnail?: string;
  formats: VideoFormat[];
  platform: string;
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  filesize?: number;
  height?: number;
  width?: number;
  vcodec?: string;
  acodec?: string;
}

export interface DownloadRequest {
  url: string;
  format: string;
  quality: string;
}

export interface DownloadStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error' | 'expired';
  progress: number;
  title?: string;
  file_size?: number;
  download_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface SupportedPlatform {
  name: string;
  extractor: string;
  supported_formats: string[];
}

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new APIError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError) {
      throw new APIError('Network error - please check your connection and try again');
    }
    
    throw new APIError('An unexpected error occurred');
  }
}

export const api = {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return apiRequest('/health');
  },

  // Get video information without downloading
  async getVideoInfo(url: string): Promise<VideoInfo> {
    return apiRequest('/api/video-info', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  // Start video download
  async startDownload(request: DownloadRequest): Promise<{ job_id: string; status: DownloadStatus }> {
    return apiRequest('/api/download', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Get download status
  async getDownloadStatus(jobId: string): Promise<DownloadStatus> {
    return apiRequest(`/api/download/${jobId}/status`);
  },

  // Get download file URL
  getDownloadFileUrl(jobId: string): string {
    return `${API_BASE_URL}/api/download/${jobId}/file`;
  },

  // Cleanup download
  async cleanupDownload(jobId: string): Promise<{ message: string }> {
    return apiRequest(`/api/download/${jobId}`, {
      method: 'DELETE',
    });
  },

  // Get supported platforms
  async getSupportedPlatforms(): Promise<{ platforms: SupportedPlatform[] }> {
    return apiRequest('/api/supported-platforms');
  },
};

// Utility functions
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return 'Unknown duration';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function isValidVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const supportedDomains = [
      'youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com',
      'twitter.com', 'x.com', 'vimeo.com', 'facebook.com',
      'twitch.tv', 'dailymotion.com', 'soundcloud.com', 'reddit.com'
    ];
    
    return supportedDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
}

// Polling utility for download status
export async function pollDownloadStatus(
  jobId: string,
  onUpdate: (status: DownloadStatus) => void,
  intervalMs: number = 2000,
  maxAttempts: number = 300 // 10 minutes max
): Promise<DownloadStatus> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        const status = await api.getDownloadStatus(jobId);
        onUpdate(status);
        
        if (status.status === 'completed' || status.status === 'error' || status.status === 'expired') {
          resolve(status);
          return;
        }
        
        if (attempts >= maxAttempts) {
          reject(new APIError('Download timeout - please try again'));
          return;
        }
        
        setTimeout(poll, intervalMs);
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
}