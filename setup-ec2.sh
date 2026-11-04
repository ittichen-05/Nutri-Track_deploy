#!/usr/bin/env bash
# ==============================================================================
# NutriTrack EC2 Automated Setup Script (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================

set -e

echo "=========================================="
echo "🚀 Starting NutriTrack EC2 Setup..."
echo "=========================================="

# 1. Update and Upgrade Packages
echo "📦 Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

# 2. Install Prerequisites & Node.js 20 LTS
echo "📦 Installing Node.js LTS (v20.x), Git, and build tools..."
sudo apt install -y curl git ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Install Nginx and PM2
echo "📦 Installing Nginx and PM2..."
sudo apt install -y nginx
sudo npm install -g pm2

# 4. Install & Configure MySQL Server (Optional / Recommended)
echo "📦 Installing MySQL Server..."
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# 5. Create Database and User
DB_NAME="nutritrack_db"
DB_USER="nutri_user"
DB_PASS="NutriTrack@Secure2026!"

echo "🗄️ Setting up MySQL database and permissions..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import Schema
if [ -f "./database/schema.sql" ]; then
    echo "📥 Importing database schema..."
    sudo mysql ${DB_NAME} < ./database/schema.sql
fi

# 6. Configure Backend .env
echo "⚙️ Configuring backend/.env..."
cat <<EOF > ./backend/.env
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=nutritrack_super_secure_jwt_secret_$(openssl rand -hex 16)
EOF

# 7. Install Dependencies & Build Frontend
echo "📦 Installing backend and frontend dependencies..."
npm run install:all

echo "🔨 Building frontend SPA for production..."
npm run build

# Optional: Seed initial foods
if [ -f "./database/seed_demo_data.js" ]; then
    echo "🌱 Seeding demo catalog items..."
    node ./database/seed_demo_data.js || echo "⚠️ Seeding skipped or completed with warnings."
fi

# 8. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx reverse proxy..."
sudo cp ./nginx-nutritrack.conf /etc/nginx/sites-available/nutritrack
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/nutritrack /etc/nginx/sites-enabled/nutritrack
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 9. Start with PM2
echo "🚀 Starting NutriTrack with PM2..."
pm2 delete nutritrack 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# 10. Firewall Configuration
echo "🛡️ Configuring UFW firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable || true

echo "=========================================================="
echo "✅ NutriTrack deployed successfully on AWS EC2!"
echo "👉 Access your app at: http://$(curl -s http://checkip.amazonaws.com)"
echo "=========================================================="
