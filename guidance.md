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

## 2. Clone Repository

Using a deploy key or HTTPS token is recommended.

```bash
cd /var/www
# Option 1: HTTPS
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git saas-architect

# Give ownership to your user (replace 'ubuntu' with your username)
sudo chown -R ubuntu:ubuntu saas-architect
cd saas-architect
```

## 3. Environment Configuration

Create the `.env` file with your production secrets.

```bash
cp .env.example .env
nano .env
```

Ensure you set:
- `NODE_ENV=production`
- `DATABASE_URL=postgres://user:pass@host:5432/db` (Use your Supabase or local PG URL)
- `GOOGLE_API_KEY=your_gemini_key`
- `PORT=5000`

## 4. Install & Build

Install dependencies and build the application.

```bash
npm install
npm run build
```

The build script will generate a `dist` folder containing `index.cjs` (Server) and `public` (Client assets).

## 5. Start with PM2

Start the application in cluster mode for reliability.

```bash
pm2 start dist/index.cjs --name "saas-app" --node-args="--env-file=.env"
pm2 save
pm2 startup
```

*(Note: The `npm start` script uses `node dist/index.cjs`, which assumes `NODE_ENV=production` is set in your environment or .env file)*

Verify it's running:
```bash
pm2 status
curl http://localhost:5000/api/health # or just curl http://localhost:5000
```

## 6. Setup Nginx Reverse Proxy

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
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL Certificate (HTTPS)

Secure your site with strict HTTPS using Certbot.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Select option **2** to Redirect HTTP to HTTPS.

## 8. Updates

To deploy new changes:

```bash
cd /var/www/saas-architect
git pull
npm install
npm run build
pm2 restart saas-app
```
