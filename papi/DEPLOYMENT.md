# Payday API - Production Deployment Guide

Complete guide for deploying the Payday API to production using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (e.g., api.payday.com)
- SSL certificates (Let's Encrypt recommended)
- Production database credentials
- Paystack/Flutterwave production API keys

## Deployment Options

### Option 1: VPS/Cloud Server (Recommended)

Suitable for: DigitalOcean, AWS EC2, Google Cloud, Azure, Linode

### Option 2: Container Platforms

Suitable for: AWS ECS, Google Cloud Run, Azure Container Instances

---

## Quick Deployment (VPS/Cloud Server)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/your-org/payday-api.git
cd payday-api
```

### Step 3: Configure Environment

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

**Critical: Update these values:**

```bash
# Strong passwords (use: openssl rand -base64 32)
DATABASE_PASSWORD=<generate-strong-password>
REDIS_PASSWORD=<generate-strong-password>

# JWT secrets (must be 32+ characters)
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>

# Encryption key (exactly 32 characters)
ENCRYPTION_KEY=<generate-32-char-key>

# Paystack production keys
PAYSTACK_SECRET_KEY=sk_live_your_actual_key
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_key

# Your Vercel frontend URL
CORS_ORIGIN=https://your-app.vercel.app
```

**Generate secure secrets:**

```bash
# Generate 32-character secrets
openssl rand -base64 32

# Or use this script
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 4: SSL Certificates

#### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone -d api.payday.com

# Copy certificates to project
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/api.payday.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/api.payday.com/privkey.pem ssl/
sudo chmod 644 ssl/*.pem
```

#### Using Custom Certificates

```bash
# Create ssl directory
mkdir -p ssl

# Copy your certificates
cp /path/to/fullchain.pem ssl/
cp /path/to/privkey.pem ssl/
```

### Step 5: Build and Deploy

```bash
# Build the Docker image
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f api

# Check service status
docker compose -f docker-compose.prod.yml ps
```

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test via domain (if DNS configured)
curl https://api.payday.com/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

---

## DNS Configuration

Point your domain to your server:

```txt
A Record:
api.payday.com -> YOUR_SERVER_IP

# Test DNS propagation
dig api.payday.com
```

---

## Frontend Configuration (Vercel)

Update your Next.js environment on Vercel:

```bash
NEXT_PUBLIC_API_URL=https://api.payday.com/api
```

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 api
```

### Restart Services

```bash
# Restart API
docker compose -f docker-compose.prod.yml restart api

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Stop all services
docker compose -f docker-compose.prod.yml down

# Start all services
docker compose -f docker-compose.prod.yml up -d
```

### Database Backup

```bash
# Backup database
docker exec payday_postgres pg_dump -U payday_user payday_production > backup_$(date +%Y%m%d).sql

# Restore database
cat backup_20240101.sql | docker exec -i payday_postgres psql -U payday_user payday_production
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d api
```

---

## Security Checklist

- [ ] Strong passwords for database and Redis
- [ ] Secure JWT secrets (32+ characters)
- [ ] SSL certificates properly configured
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular backups automated
- [ ] Monitoring and alerting setup
- [ ] Rate limiting enabled
- [ ] CORS configured for your domain only
- [ ] Production API keys from Paystack/Flutterwave
- [ ] Environment variables not committed to git

---

## Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## Performance Tuning

### Increase Docker Resources

Edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### PostgreSQL Tuning

```bash
# Connect to PostgreSQL container
docker exec -it payday_postgres psql -U payday_user payday_production

# Run inside psql
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;

# Restart PostgreSQL
docker compose -f docker-compose.prod.yml restart postgres
```

---

## Troubleshooting

### API not responding

```bash
# Check if container is running
docker ps

# Check API logs
docker logs payday_api

# Restart API
docker compose -f docker-compose.prod.yml restart api
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs payday_postgres

# Test connection
docker exec -it payday_postgres psql -U payday_user payday_production
```

### Redis connection failed

```bash
# Check Redis is running
docker ps | grep redis

# Test Redis connection
docker exec -it payday_redis redis-cli -a YOUR_REDIS_PASSWORD ping
```

### High memory usage

```bash
# Check container resource usage
docker stats

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### SSL certificate expired

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/api.payday.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/api.payday.com/privkey.pem ssl/

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Automated Backups

Create backup script (`backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec payday_postgres pg_dump -U payday_user payday_production | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup Redis
docker exec payday_redis redis-cli -a YOUR_REDIS_PASSWORD SAVE
docker cp payday_redis:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "redis_*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:

```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/payday-backup.log 2>&1
```

---

## Monitoring Setup

### Using Uptime Robot (Free)

1. Sign up at uptimerobot.com
2. Add monitor:
   - Type: HTTP(s)
   - URL: [health check](https://api.payday.com/health)
   - Interval: 5 minutes
3. Set up email/SMS alerts

### Using Grafana + Prometheus (Advanced)

Add to `docker-compose.prod.yml`:

```yaml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Scaling

### Horizontal Scaling

Add more API instances:

```yaml
  api:
    deploy:
      replicas: 3
```

### Load Balancing

Nginx already handles load balancing to multiple API instances.

---

## Cost Optimization

### Minimum Requirements

- **VPS**: 2 GB RAM, 1 vCPU, 25 GB SSD (~$12/month)
- **Database**: Included in VPS
- **Redis**: Included in VPS
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$12-15/month

### Recommended Production

- **VPS**: 4 GB RAM, 2 vCPU, 50 GB SSD (~$24/month)
- **Backups**: $5/month
- **Monitoring**: Free tier
- **Total**: ~$30/month

---

## Support

For issues:

- Check logs: `docker compose -f docker-compose.prod.yml logs`
- Review this guide
- Check backend README.md

---

You're now running Payday API in production! 🚀
