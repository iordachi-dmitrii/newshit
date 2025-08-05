# Multi-stage Dockerfile for VideoVault
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app
COPY package*.json ./
COPY bun.lock* ./
RUN npm install -g bun
RUN bun install
COPY . .
RUN bun run build

# Python backend with built frontend
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip install yt-dlp

# Set working directory
WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend
COPY --from=frontend-build /app/dist ./static

# Create downloads directory
RUN mkdir -p downloads

# Expose port for Render
EXPOSE 10000

# Environment variables
ENV PYTHONPATH=/app
ENV PORT=10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:10000/health || exit 1

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]