#!/bin/bash
set -e # Stop on error

# --- CONFIGURATION ---
VPS_USER="root"
VPS_IP="157.90.167.157"
REMOTE_DIR="/var/www/structio"
SERVICE_NAME="structio-portal"

echo "🚀 Deploying StructIO Portal..."

# 1. Build Backend (Go)
echo "🔨 Building Backend..."
cd backend
# Compiling for Linux x86 (Hetzner)
GOOS=linux GOARCH=amd64 go build -o portal-api ./cmd/api
cd ..

# 2. Build Frontend (Next.js)
echo "🎨 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 3. Stop Service (Safety first)
echo "🛑 Stopping Remote Service..."
ssh $VPS_USER@$VPS_IP "systemctl stop $SERVICE_NAME"

# 4. Upload Binaries & Assets
echo "📦 Uploading Files..."
# Make sure folders exist
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR/dist"

# Upload Go Binary
scp backend/portal-api $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Upload Static HTML/JS (Delete old ones first to be clean)
ssh $VPS_USER@$VPS_IP "rm -rf $REMOTE_DIR/dist/*"
scp -r frontend/out/* $VPS_USER@$VPS_IP:$REMOTE_DIR/dist/

# 5. Restart Service
echo "✅ Restarting Service..."
ssh $VPS_USER@$VPS_IP "chmod +x $REMOTE_DIR/portal-api"
ssh $VPS_USER@$VPS_IP "systemctl start $SERVICE_NAME"

echo "🎉 Deployment Complete!"