#!/usr/bin/env bash
# ==============================================================================
# NutriTrack — Automated Deployment Script for AWS EC2 (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
set -e

echo "=========================================================="
echo "🚀 Starting NutriTrack Automated Deployment on AWS EC2..."
echo "=========================================================="

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# ------------------------------------------------------------------------------
# 1. Memory Swap Allocation (Essential for t2.micro / t3.micro 1GB RAM)
# ------------------------------------------------------------------------------
if [ ! -f /swapfile ]; then
    echo "📦 Creating 2GB swap memory to prevent out-of-memory errors during build..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap memory enabled."
else
    echo "ℹ️  Swap file already exists."
fi

# ------------------------------------------------------------------------------
# 2. System Update & Dependencies
# ------------------------------------------------------------------------------
echo "🔄 Updating apt packages..."
sudo apt update -y

echo "📦 Installing required packages (curl, git, nginx, mysql-server)..."
sudo apt install -y curl git nginx mysql-server build-essential

# ------------------------------------------------------------------------------
# 3. Install Node.js 20 LTS
# ------------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 20 ]; then
    echo "🟢 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install PM2 globally
sudo npm install -g pm2

# ------------------------------------------------------------------------------
# 4. Configure MySQL Database
# ------------------------------------------------------------------------------
echo "🐬 Configuring MySQL Database..."
sudo systemctl start mysql
sudo systemctl enable mysql

DB_NAME="nutritrack_db"
DB_USER="nutri_user"
DB_PASS="NutriSecurePass2026!"

sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "📥 Importing database schema..."
sudo mysql ${DB_NAME} < database/schema.sql

# ------------------------------------------------------------------------------
# 5. Setup Environment Variables
# ------------------------------------------------------------------------------
echo "⚙️ Creating backend/.env configuration..."
cat <<EOF > backend/.env
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=nutritrack_production_jwt_secret_key_$(openssl rand -hex 16)
EOF

# ------------------------------------------------------------------------------
# 6. Install Dependencies & Build Frontend
# ------------------------------------------------------------------------------
echo "📦 Installing backend and frontend dependencies..."
npm run install:all

echo "🌱 Seeding initial foods catalog and demo user data..."
npm run seed || echo "⚠️ Seed script completed with warnings, continuing..."

echo "🏗️ Building Vite React frontend for production..."
npm run build

# ------------------------------------------------------------------------------
# 7. Setup PM2 Process Manager
# ------------------------------------------------------------------------------
echo "🚀 Starting NutriTrack with PM2..."
pm2 delete nutritrack || true
pm2 start ecosystem.config.cjs
pm2 save

# Setup PM2 to restart on server reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME || true

# ------------------------------------------------------------------------------
# 8. Configure Nginx Reverse Proxy
# ------------------------------------------------------------------------------
echo "🌐 Configuring Nginx reverse proxy on port 80..."
sudo cp nutritrack-nginx.conf /etc/nginx/sites-available/nutritrack
sudo ln -sf /etc/nginx/sites-available/nutritrack /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# ------------------------------------------------------------------------------
# 9. Completion Notice
# ------------------------------------------------------------------------------
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://api.ipify.org || echo "<YOUR-EC2-PUBLIC-IP>")

echo ""
echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================================="
echo "NutriTrack is now running and live on your EC2 instance."
echo ""
echo "👉 Web URL: http://${PUBLIC_IP}"
echo "👉 Health Check: http://${PUBLIC_IP}/api/health"
echo ""
echo "Management commands:"
echo "  - Check status:  pm2 status"
echo "  - View logs:     pm2 logs nutritrack"
echo "  - Restart app:   pm2 restart nutritrack"
echo "  - Nginx status:  sudo systemctl status nginx"
echo "=========================================================="
