#!/bin/bash

# VideoVault Production Deployment Script
# This script helps you deploy VideoVault to production

set -e

echo "🎬 VideoVault Production Deployment"
echo "=================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed."
    echo "   Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed."
    echo "   Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Check for production environment file
if [ ! -f ".env.prod" ]; then
    echo "📝 Creating production environment file..."
    cp .env.prod.example .env.prod
    echo "⚠️  Please edit .env.prod with your production values before continuing!"
    echo "   Required values:"
    echo "   - DOMAIN=yourdomain.com"
    echo "   - AWS_ACCESS_KEY_ID=your_aws_key"
    echo "   - AWS_SECRET_ACCESS_KEY=your_aws_secret"
    echo "   - AWS_BUCKET_NAME=your_bucket"
    read -p "Press Enter to open .env.prod for editing..."
    ${EDITOR:-nano} .env.prod
fi

# Load environment variables
export $(cat .env.prod | grep -v '^#' | xargs)

echo "🔐 Generating SSL certificates..."
chmod +x nginx/ssl/generate-certs.sh
./nginx/ssl/generate-certs.sh ${DOMAIN:-localhost}

echo "🏗️ Building production images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting production deployment..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

if docker-compose -f docker-compose.prod.yml exec -T api curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: https://${DOMAIN:-localhost}"
echo "   API:      https://${DOMAIN:-localhost}/api/"
echo "   Health:   https://${DOMAIN:-localhost}/health"
echo ""
echo "🔧 Management commands:"
echo "   View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart:       docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "⚠️  Next steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Replace self-signed certificates with real SSL certificates"
echo "   3. Configure backups and monitoring"
echo "   4. Review security settings"

# Optional monitoring setup
read -p "🔍 Would you like to start monitoring services? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting monitoring stack..."
    docker-compose -f docker-compose.prod.yml --profile monitoring up -d
    echo "📊 Monitoring available at:"
    echo "   Prometheus: http://localhost:9090"
    echo "   Grafana:    http://localhost:3000 (admin/admin123)"
fi