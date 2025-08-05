# VideoVault Cloud Deployment Guide

This guide covers deploying VideoVault to various cloud platforms.

## 🌩️ Quick Deployment Options

### 1. Railway (Recommended for Beginners)
**✅ Pros:** Simple, built-in Redis, automatic HTTPS, reasonable pricing
**❌ Cons:** Limited to 8GB RAM per service

### 2. DigitalOcean App Platform  
**✅ Pros:** Good performance, managed databases, competitive pricing
**❌ Cons:** Limited customization

### 3. AWS (Advanced Users)
**✅ Pros:** Full control, enterprise features, global presence
**❌ Cons:** Complex setup, higher costs

### 4. Google Cloud Run
**✅ Pros:** Serverless, pay-per-use, automatic scaling
**❌ Cons:** Cold starts, request limits

---

## 🚂 Railway Deployment

Railway is the easiest option for getting started.

### Step 1: Prepare Your Repository

```bash
# Clone your VideoVault repository
git clone <your-repo>
cd video-downloader

# Create production environment
cp .env.prod .env.railway
# Edit .env.railway with your values
```

### Step 2: Deploy Backend to Railway

1. **Sign up at [railway.app](https://railway.app)**
2. **Create New Project → Deploy from GitHub**
3. **Select your VideoVault repository**
4. **Add Redis database:**
   - In your project dashboard → Add Service → Database → Redis

### Step 3: Configure Backend Service

**Railway Project Settings:**
```yaml
# railway.toml
[build]
  builder = "DOCKERFILE"
  dockerfilePath = "backend/Dockerfile"

[deploy]
  startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2"
  healthcheckPath = "/health"
  healthcheckTimeout = 60
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 3
```

**Environment Variables:**
```env
REDIS_URL=${{Redis.REDIS_URL}}
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
CORS_ORIGINS=https://your-frontend-url.up.railway.app
PORT=8000
```

### Step 4: Deploy Frontend

**Option A: Separate Frontend Service**
1. **Add new service → Deploy from GitHub → Same repo**
2. **Set build configuration:**
   ```yaml
   # railway.toml (in root)
   [build]
     builder = "DOCKERFILE"
     dockerfilePath = "Dockerfile.prod"
   
   [deploy]
     startCommand = "nginx -g 'daemon off;'"
   ```

**Option B: Use Vercel/Netlify for Frontend**
1. **Connect repository to Vercel/Netlify**
2. **Build settings:**
   ```bash
   Build command: bun build
   Output directory: dist
   ```
3. **Environment variables:**
   ```env
   VITE_API_BASE_URL=https://your-backend.up.railway.app
   ```

---

## 🌊 DigitalOcean App Platform

### Step 1: Create App Spec

Create `.do/app.yaml`:
```yaml
name: videovault
services:
- name: api
  source_dir: /backend
  github:
    repo: your-username/video-downloader
    branch: main
  run_command: uvicorn main:app --host 0.0.0.0 --port 8080 --workers 2
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  health_check:
    http_path: /health
  envs:
  - key: REDIS_URL
    value: ${redis.DATABASE_URL}
  - key: AWS_BUCKET_NAME
    value: your-bucket-name
    type: SECRET
  - key: AWS_ACCESS_KEY_ID
    type: SECRET
  - key: AWS_SECRET_ACCESS_KEY
    type: SECRET

- name: frontend
  source_dir: /
  github:
    repo: your-username/video-downloader
    branch: main
  build_command: bun build
  run_command: nginx -g 'daemon off;'
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 80
  routes:
  - path: /
  envs:
  - key: VITE_API_BASE_URL
    value: ${api.PUBLIC_URL}

databases:
- name: redis
  engine: REDIS
  version: "7"
  size: basic-xxs
```

### Step 2: Deploy

```bash
# Install doctl CLI
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create app
doctl apps create .do/app.yaml

# Get app info
doctl apps list
```

---

## ☁️ AWS Deployment (Advanced)

### Architecture Overview
```
Internet → ALB → ECS Fargate (API) → ElastiCache (Redis)
        ↘ CloudFront → S3 (Frontend)
```

### Step 1: Infrastructure Setup

**Create infrastructure with Terraform:**

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# VPC and networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "videovault-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "videovault"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "videovault-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = false
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "videovault-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "videovault-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

# S3 bucket for downloads
resource "aws_s3_bucket" "downloads" {
  bucket = "videovault-downloads-${random_string.bucket_suffix.result}"
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}
```

### Step 2: Deploy with ECS

**Create task definition:**
```json
{
  "family": "videovault-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "your-account.dkr.ecr.us-east-1.amazonaws.com/videovault-api:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "REDIS_URL",
          "value": "redis://your-redis-endpoint:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/videovault-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 3: Deploy Frontend to S3 + CloudFront

```bash
# Build and deploy frontend
bun build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

---

## 🚀 Google Cloud Run

### Step 1: Prepare Backend

**Create cloudbuild.yaml:**
```yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/videovault-api', './backend']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/videovault-api']
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
  - 'run'
  - 'deploy'
  - 'videovault-api'
  - '--image'
  - 'gcr.io/$PROJECT_ID/videovault-api'
  - '--region'
  - 'us-central1'
  - '--platform'
  - 'managed'
  - '--allow-unauthenticated'
```

### Step 2: Deploy

```bash
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable redis.googleapis.com

# Create Redis instance
gcloud redis instances create videovault-redis \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_7_0

# Deploy backend
gcloud builds submit --config cloudbuild.yaml

# Deploy frontend to Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 🔧 Post-Deployment Configuration

### 1. SSL Certificates

**Let's Encrypt (Free):**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**CloudFlare (Recommended):**
1. Add your domain to CloudFlare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Set SSL/TLS mode to "Full (Strict)"

### 2. Domain Configuration

**DNS Records:**
```
Type    Name    Value                           TTL
A       @       your-server-ip                  300
A       www     your-server-ip                  300
CNAME   api     your-backend-domain.com         300
```

### 3. Monitoring Setup

**Add health checks:**
```bash
# Create uptime monitoring
curl -X POST https://api.uptimerobot.com/v2/newMonitor \
  -d "api_key=YOUR_API_KEY" \
  -d "friendly_name=VideoVault API" \
  -d "url=https://yourdomain.com/health" \
  -d "type=1"
```

### 4. Backup Strategy

**Automated backups:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)

# Backup Redis data
docker exec videovault_redis_1 redis-cli BGSAVE
docker cp videovault_redis_1:/data/dump.rdb "./backups/redis_backup_$DATE.rdb"

# Upload to S3
aws s3 cp "./backups/redis_backup_$DATE.rdb" s3://your-backup-bucket/redis/
```

---

## 🔒 Security Checklist

- [ ] **SSL/TLS enabled** with valid certificates
- [ ] **Firewall configured** (only necessary ports open)
- [ ] **Rate limiting** implemented
- [ ] **Environment variables** secured (no secrets in code)
- [ ] **CORS** properly configured
- [ ] **Input validation** enabled
- [ ] **File size limits** enforced
- [ ] **Monitoring** and alerting set up
- [ ] **Backups** automated
- [ ] **Updates** scheduled

---

## 💰 Cost Estimates

| Platform | Monthly Cost | Setup Difficulty | Best For |
|----------|-------------|------------------|-----------|
| Railway | $5-20 | ⭐ Easy | Beginners |
| DigitalOcean | $10-40 | ⭐⭐ Medium | Small-Medium traffic |
| AWS | $20-100+ | ⭐⭐⭐⭐ Hard | Enterprise |
| Google Cloud | $15-50 | ⭐⭐⭐ Medium-Hard | Developers |

Choose based on your technical expertise and expected traffic volume.