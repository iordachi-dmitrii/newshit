import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  api, 
  VideoInfo, 
  DownloadStatus,
  formatFileSize,
  formatDuration,
  isValidVideoUrl,
  pollDownloadStatus
} from "@/lib/api";
import { 
  Download, 
  Play, 
  Shield, 
  Zap, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Youtube,
  Instagram,
  Twitter,
  Music,
  Video,
  Image,
  FileVideo,
  Sparkles,
  ArrowRight,
  Info,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2
} from "lucide-react";

interface DownloadItem extends DownloadStatus {
  url: string;
  platform: string;
  format: string;
  quality: string;
  videoInfo?: VideoInfo;
}

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('720p');
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const detectPlatform = (url: string) => {
    if (!url) return 'Unknown';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('twitch.tv')) return 'Twitch';
    if (url.includes('dailymotion.com')) return 'Dailymotion';
    if (url.includes('soundcloud.com')) return 'SoundCloud';
    if (url.includes('reddit.com')) return 'Reddit';
    return 'Unknown';
  };

  // Check backend status on mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await api.healthCheck();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  // Load video info when URL changes
  useEffect(() => {
    const loadVideoInfo = async () => {
      if (!url.trim() || !isValidVideoUrl(url)) {
        setVideoInfo(null);
        return;
      }

      setIsLoadingInfo(true);
      setError('');
      
      try {
        const info = await api.getVideoInfo(url);
        setVideoInfo(info);
      } catch (err) {
        console.error('Failed to load video info:', err);
        setVideoInfo(null);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    const timeoutId = setTimeout(loadVideoInfo, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [url]);

  const copyExampleUrl = (exampleUrl: string) => {
    setUrl(exampleUrl);
    navigator.clipboard.writeText(exampleUrl);
  };

  const refreshDownloadStatus = async (downloadId: string) => {
    try {
      const status = await api.getDownloadStatus(downloadId);
      setDownloads(prev => prev.map(item => 
        item.id === downloadId ? { ...item, ...status } : item
      ));
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a valid video URL');
      return;
    }
    
    if (!isValidVideoUrl(url)) {
      setError('Please enter a valid video URL from a supported platform');
      return;
    }
    
    if (backendStatus === 'offline') {
      setError('Backend service is offline. Please try again later.');
      return;
    }
    
    setError('');
    setIsProcessing(true);
    
    try {
      // Start download
      const response = await api.startDownload({
        url,
        format,
        quality
      });
      
      const downloadItem: DownloadItem = {
        ...response.status,
        url,
        platform: detectPlatform(url),
        format,
        quality,
        videoInfo: videoInfo || undefined
      };
      
      setDownloads(prev => [downloadItem, ...prev]);
      setUrl('');
      setVideoInfo(null);
      
      // Start polling for status updates
      pollDownloadStatus(
        response.job_id,
        (updatedStatus) => {
          setDownloads(prev => prev.map(item => 
            item.id === response.job_id 
              ? { ...item, ...updatedStatus }
              : item
          ));
        }
      ).catch(err => {
        console.error('Polling error:', err);
        setDownloads(prev => prev.map(item => 
          item.id === response.job_id 
            ? { ...item, status: 'error' as const, error_message: 'Download monitoring failed' }
            : item
        ));
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = (download: DownloadItem) => {
    if (download.download_url) {
      if (download.download_url.startsWith('http')) {
        // External URL (S3, etc.)
        window.open(download.download_url, '_blank');
      } else {
        // Local backend URL
        window.open(api.getDownloadFileUrl(download.id), '_blank');
      }
    }
  };

  const handleCleanupDownload = async (downloadId: string) => {
    try {
      await api.cleanupDownload(downloadId);
      setDownloads(prev => prev.filter(item => item.id !== downloadId));
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  };

  const supportedPlatforms = [
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'TikTok', icon: Video, color: 'text-black' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'Twitter', icon: Twitter, color: 'text-blue-500' },
    { name: 'Vimeo', icon: Play, color: 'text-blue-600' },
    { name: 'Facebook', icon: Globe, color: 'text-blue-700' },
    { name: 'Twitch', icon: Video, color: 'text-purple-500' },
    { name: 'Dailymotion', icon: FileVideo, color: 'text-orange-500' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Download videos in seconds with our optimized servers'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your downloads are processed securely without storing personal data'
    },
    {
      icon: Globe,
      title: 'Multiple Platforms',
      description: 'Support for YouTube, TikTok, Instagram, Twitter, and more'
    },
    {
      icon: FileVideo,
      title: 'Multiple Formats',
      description: 'Download in MP4, MP3, AVI, and other popular formats'
    }
  ];

  const exampleUrls = {
    YouTube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    TikTok: 'https://www.tiktok.com/@user/video/1234567890',
    Instagram: 'https://www.instagram.com/p/ABC123/',
    Twitter: 'https://twitter.com/user/status/1234567890'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
              <Sparkles size={16} />
              <span>Free Forever</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            VideoVault
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Download videos from YouTube, TikTok, Instagram, Twitter, and more.
            <br />
            <span className="font-semibold text-gray-800">Fast, Free, and Secure.</span>
          </p>
          
          {/* Download Form */}
          <Card className="max-w-4xl mx-auto mb-12 shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Paste Video URL</CardTitle>
                  <CardDescription>
                    Enter the URL of any video from supported platforms
                  </CardDescription>
                </div>
                <Badge 
                  variant={backendStatus === 'online' ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    backendStatus === 'online' ? 'bg-green-500' : 
                    backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  {backendStatus === 'online' ? 'Online' : 
                   backendStatus === 'offline' ? 'Offline' : 'Checking...'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 text-lg pr-10"
                    />
                    {isLoadingInfo && (
                      <Loader2 className="absolute right-3 top-4 h-6 w-6 animate-spin text-blue-500" />
                    )}
                  </div>
                  
                  {videoInfo && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        {videoInfo.thumbnail && (
                          <img 
                            src={videoInfo.thumbnail} 
                            alt="Video thumbnail" 
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{videoInfo.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-300">
                            <Badge variant="secondary" className="text-xs">{videoInfo.platform}</Badge>
                            {videoInfo.duration && <span>{formatDuration(videoInfo.duration)}</span>}
                            {videoInfo.uploader && <span>by {videoInfo.uploader}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {url && !videoInfo && !isLoadingInfo && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">
                        {detectPlatform(url)}
                      </Badge>
                    </div>
                  )}
                  
                  {!url && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowTutorial(!showTutorial)}
                        className="text-xs"
                      >
                        <Info className="mr-1 h-3 w-3" />
                        Need help? Try example URLs
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="avi">AVI</SelectItem>
                      <SelectItem value="mov">MOV</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="360p">360p</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleDownload} 
                    disabled={!url.trim() || isProcessing}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download className="mr-2" size={20} />
                    {isProcessing ? 'Processing...' : 'Download'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Downloads Section */}
          {downloads.length > 0 && (
            <Card className="max-w-4xl mx-auto mb-12">
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {downloads.map((download) => (
                    <div key={download.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{download.title || download.videoInfo?.title || 'Video Download'}</span>
                          <Badge variant="outline">{download.platform}</Badge>
                          <Badge variant="outline">{download.format.toUpperCase()}</Badge>
                          <Badge variant="outline">{download.quality}</Badge>
                          {download.file_size && (
                            <Badge variant="outline">{formatFileSize(download.file_size)}</Badge>
                          )}
                        </div>
                        
                        {download.status === 'queued' && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Queued for processing...</span>
                          </div>
                        )}
                        
                        {download.status === 'processing' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Loader2 size={16} className="text-blue-500 animate-spin" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">Processing... {Math.round(download.progress)}%</span>
                            </div>
                            <Progress value={download.progress} className="h-2" />
                          </div>
                        )}
                        
                        {download.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">Ready to download</span>
                            <Button 
                              size="sm" 
                              onClick={() => handleDownloadFile(download)}
                              className="ml-2"
                            >
                              <Download size={16} className="mr-1" />
                              Download File
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => refreshDownloadStatus(download.id)}
                            >
                              <RefreshCw size={16} className="mr-1" />
                              Refresh
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCleanupDownload(download.id)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                        
                        {download.status === 'error' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle size={16} className="text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-400">Error occurred</span>
                            </div>
                            {download.error_message && (
                              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {download.error_message}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => refreshDownloadStatus(download.id)}
                              >
                                <RefreshCw size={16} className="mr-1" />
                                Retry
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCleanupDownload(download.id)}
                              >
                                <Trash2 size={16} className="mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {download.status === 'expired' && (
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-orange-500" />
                            <span className="text-sm text-orange-600 dark:text-orange-400">Download expired</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCleanupDownload(download.id)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                        
                        {download.videoInfo && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {download.videoInfo.uploader && `by ${download.videoInfo.uploader} • `}
                            {download.videoInfo.duration && `${formatDuration(download.videoInfo.duration)} • `}
                            {download.videoInfo.view_count && `${download.videoInfo.view_count.toLocaleString()} views`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tutorial Section */}
          {showTutorial && (
            <Card className="max-w-4xl mx-auto mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info size={20} />
                  How to Use VideoVault
                </CardTitle>
                <CardDescription>
                  Try these example URLs to see how it works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(exampleUrls).map(([platform, exampleUrl]) => (
                    <div key={platform} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{platform}</div>
                        <div className="text-xs text-gray-500 truncate">{exampleUrl}</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyExampleUrl(exampleUrl)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Quick Steps:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600 dark:text-gray-300">
                    <li>Copy a video URL from any supported platform</li>
                    <li>Paste it in the input field above</li>
                    <li>Select your preferred format and quality</li>
                    <li>Click Download and wait for processing</li>
                    <li>Download your file when ready</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">1M+</div>
              <div className="text-gray-600 dark:text-gray-300">Videos Downloaded</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Countries Served</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-pink-600">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Platforms</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {supportedPlatforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center p-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <platform.icon className={`w-8 h-8 mb-2 ${platform.color}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose VideoVault?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is VideoVault really free?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes! VideoVault is completely free to use. We don't charge for downloads or limit the number of videos you can download.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What video platforms do you support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">We support YouTube, TikTok, Instagram, Twitter, Vimeo, Facebook, Twitch, Dailymotion, and many more platforms. The list is constantly growing!</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is it safe to use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Absolutely! We don't store your personal information or the videos you download. Everything is processed securely and deleted after download.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What formats can I download?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">You can download videos in MP4, AVI, MOV formats, and audio in MP3 format. We support various quality options from 360p to 1080p.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">VideoVault</h3>
          <p className="text-gray-400 mb-4">The fastest and most reliable video downloader on the web.</p>
          <div className="flex justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ExternalLink className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Globe className="mr-2 h-4 w-4" />
              API Docs
            </Button>
          </div>
          <p className="text-sm text-gray-500">© 2024 VideoVault. All rights reserved. Built with Scout.</p>
        </div>
      </footer>
    </div>
  );
}
