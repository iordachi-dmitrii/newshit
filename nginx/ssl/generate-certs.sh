#!/bin/bash

# Generate self-signed SSL certificates for development/testing
# For production, replace with real certificates from Let's Encrypt or your CA

SSL_DIR="$(dirname "$0")"
DOMAIN="${1:-localhost}"

echo "Generating self-signed SSL certificates for $DOMAIN..."

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Generate private key
openssl genrsa -out "$SSL_DIR/key.pem" 2048

# Generate certificate signing request
openssl req -new -key "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.csr" -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=$DOMAIN"

# Generate self-signed certificate
openssl x509 -req -days 365 -in "$SSL_DIR/cert.csr" -signkey "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.pem"

# Clean up CSR file
rm "$SSL_DIR/cert.csr"

# Set proper permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo "SSL certificates generated:"
echo "  Certificate: $SSL_DIR/cert.pem"
echo "  Private Key: $SSL_DIR/key.pem"
echo ""
echo "⚠️  WARNING: These are self-signed certificates for development only!"
echo "   For production, use real certificates from Let's Encrypt or a trusted CA."
echo ""
echo "To use Let's Encrypt certificates instead:"
echo "  1. Install certbot"
echo "  2. Run: certbot certonly --webroot -w /usr/share/nginx/html -d yourdomain.com"
echo "  3. Copy certificates to this directory"