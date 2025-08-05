# 🚀 Deploy VideoVault to Netlify

## Option 1: Frontend Only (Quick Start)

### Step 1: Deploy Frontend to Netlify
1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for Netlify"
   git push origin main
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your VideoVault repository
   - **Build settings**:
     - Build command: `bun build`
     - Publish directory: `dist`
   - **Environment variables**:
     ```
     VITE_API_BASE_URL=https://video-downloader-28d66f17.scout.site/api
     ```
   - Click "Deploy site"

### Step 2: Configure Custom Domain (Optional)
- In Netlify dashboard → Domain settings
- Add your custom domain
- Configure DNS with your domain provider

---

## Option 2: Full Stack (Frontend + Backend)

### Step 1: Deploy Backend to Railway
1. **Create Railway account**: [railway.app](https://railway.app)
2. **New Project** → "Deploy from GitHub"
3. **Select your repo** → Configure:
   - **Root directory**: `backend`
   - **Start command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Add Redis database** in Railway dashboard
5. **Environment variables**:
   ```
   REDIS_URL=${{Redis.REDIS_URL}}
   CORS_ORIGINS=https://your-netlify-site.netlify.app
   AWS_BUCKET_NAME=your-bucket-name
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   ```

### Step 2: Deploy Frontend to Netlify
1. **Update netlify.toml**:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend.up.railway.app/api/:splat"
     status = 200
   ```
2. **Environment variables in Netlify**:
   ```
   VITE_API_BASE_URL=https://your-backend.up.railway.app
   ```
3. **Deploy**: Follow Option 1 steps

---

## 🎯 Quick Deploy Commands

```bash
# 1. Final build test
bun build

# 2. Push to GitHub
git add .
git commit -m "Production ready for Netlify"
git push

# 3. Go to Netlify dashboard and import!
```

## 🔧 Netlify-Specific Optimizations

### Build Performance
- Uses `bun` for faster builds
- Optimized caching headers
- Asset compression enabled

### Security
- CSP headers configured
- XSS protection enabled
- Frame options set

### Redirects
- SPA routing handled
- API proxy configured
- 404 fallbacks set

## 🌐 URLs After Deployment

- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend.up.railway.app`
- **API Docs**: `https://your-backend.up.railway.app/docs`

Your VideoVault will be live in minutes! 🎬