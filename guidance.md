# Hosting Guide for Ubuntu VPS

This guide will walk you through deploying your application to an Ubuntu VPS using PM2 and Nginx.

## Prerequisites

- **Ubuntu VPS** (20.04 or 22.04 LTS recommended)
- **Domain Name** pointed to your VPS IP address
- **SSH Access** to your server

## 1. Initial Server Setup & Dependencies

Connect to your server and update packages:

```bash
ssh user@your-vps-ip
sudo apt update && sudo apt upgrade -y
```

Install Node.js (via NVM is recommended, but direct is fine):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Install Process Manager (PM2) and Git:

```bash
sudo npm install -g pm2
sudo apt install -y git
```

## 2. Dedicated Web User (Security Recommended)

Create a system user `webuser` with limited privileges (no login shell) to run the application.

```bash
# Create user 'webuser' (system user, no login)
sudo useradd -r -s /usr/sbin/nologin -d /var/www webuser

# Create access to the app folder
sudo usermod -aG webuser $USER
```

## 3. Clone / Setup Repository

Since you are deploying directly to `/var/www`:

```bash
cd /var/www

# Ensure directory is owned by current user (for cloning/copying)
sudo chown $USER:$USER /var/www

# Clone the repo (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
# OR if files are already there, just ensure they are in /var/www

# Set ownership to webuser:webuser for security
sudo chown -R webuser:webuser /var/www
sudo chmod -R 775 /var/www
```

## 4. Environment Configuration

Create the `.env` file with your production secrets.

```bash
cp .env.example .env
# Edit the file (you might need sudo if owned by webuser)
sudo -u webuser nano .env
```

Ensure you set:
- `NODE_ENV=production`
- `DATABASE_URL=postgres://user:pass@host:5432/db` (Use your Supabase or local PG URL)
- `GOOGLE_API_KEY=your_gemini_key`
- `PORT=5000`

## 5. Install & Build

Install dependencies and build the application.

```bash
# Run as webuser to maintain permission consistency
sudo -u webuser npm install
sudo -u webuser npm run build
```

The build script will generate a `dist` folder containing `index.cjs` (Server) and `public` (Client assets).

## 6. Start with PM2 (as webuser)

Start the application *as the webuser* to restrict its access.

```bash
# Start the app using the ecosystem file
sudo -u webuser npx pm2 start ecosystem.config.cjs

# Save the process list (for webuser)
sudo -u webuser npx pm2 save

# Generate startup script dynamically
# 1. Run this command to generate the script:
sudo pm2 startup systemd -u webuser --hp /var/www

# 2. COPY AND PASTE the output command that starts with "sudo env PATH=..."
# Run that pasted command to enable startup.
```

*(To check status later: `sudo -u webuser pm2 status`)*
*(To check logs if 'errored': `sudo -u webuser pm2 logs`)*

## 7. Setup Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt install -y nginx
```

Create a new configuration block:

```bash
sudo nano /etc/nginx/sites-available/saas-app
```

Paste the following (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/saas-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 8. SSL Certificate (HTTPS)

Secure your site with strict HTTPS using Certbot.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Select option **2** to Redirect HTTP to HTTPS.

## 9. Updates

To deploy new changes:

```bash
cd /var/www
git pull
sudo -u webuser npm install
sudo -u webuser npm run build
sudo -u webuser pm2 restart saas-app
```
