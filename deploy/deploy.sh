# #!/bin/bash
# set -e 

# VPS_USER="root"
# VPS_IP="157.90.167.157"
# REMOTE_DIR="/var/www/structio"
# SERVICE_NAME="structio-portal"

# echo "Deploying StructIO Portal..."

# echo "Building Backend..."
# cd backend
# GOOS=linux GOARCH=amd64 go build -o portal-api ./cmd/api
# cd ..

# echo "Building Frontend..."
# cd frontend
# npm install
# npm run build
# cd ..

# echo "Stopping Remote Service..."
# ssh $VPS_USER@$VPS_IP "systemctl stop $SERVICE_NAME"

# echo "Uploading Files..."
# ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR/dist"

# scp backend/portal-api $VPS_USER@$VPS_IP:$REMOTE_DIR/

# ssh $VPS_USER@$VPS_IP "rm -rf $REMOTE_DIR/dist/*"
# scp -r frontend/out/* $VPS_USER@$VPS_IP:$REMOTE_DIR/dist/

# echo "Restarting Service..."
# ssh $VPS_USER@$VPS_IP "chmod +x $REMOTE_DIR/portal-api"
# ssh $VPS_USER@$VPS_IP "systemctl start $SERVICE_NAME"

# echo "Deployment Complete!"