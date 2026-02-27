# Deployment Guide

This guide covers how to deploy the Portfolio Management System frontend.

## Local Development

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Setup
```bash
pnpm install
cp .env.example .env.local
# Update .env.local with your API URL
pnpm dev
```

Visit `http://localhost:3000`

---

## Production Deployment

### Option 1: Vercel (Recommended)

Vercel is the optimal choice for Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the project root directory

3. **Configure Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add the following:
     ```
     NEXT_PUBLIC_API_URL=https://api.example.com/api
     NEXT_PUBLIC_APP_URL=https://portfolio.example.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `*.vercel.app`

5. **Custom Domain**
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

#### CI/CD Configuration

Vercel automatically deploys on push. For more control, create a `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

---

### Option 2: Docker

Deploy using Docker on any platform (AWS, GCP, Azure, etc).

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["pnpm", "start"]
```

#### Build and Run

```bash
# Build
docker build -t portfolio-frontend .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api.example.com \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  portfolio-frontend
```

#### Deploy to Docker Hub

```bash
docker tag portfolio-frontend your-username/portfolio-frontend
docker push your-username/portfolio-frontend
```

---

### Option 3: AWS

#### Using EC2 + GitHub Actions

1. **Create EC2 Instance**
   - Launch Ubuntu 22.04 LTS instance
   - Open ports 80, 443, 22, 3000

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm
   npm install -g pnpm
   ```

3. **Clone Repository**
   ```bash
   cd /home/ubuntu
   git clone <repository-url>
   cd my-app
   pnpm install
   ```

4. **Setup Environment**
   ```bash
   cp .env.example .env.production
   nano .env.production  # Add production values
   ```

5. **Build**
   ```bash
   pnpm build
   ```

6. **Setup PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start "pnpm start" --name "portfolio"
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx (Reverse Proxy)**
   ```nginx
   server {
     listen 80;
     server_name portfolio.example.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

8. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d portfolio.example.com
   ```

#### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_KEY }}
          script: |
            cd /home/ubuntu/my-app
            git pull
            pnpm install
            pnpm build
            pm2 restart portfolio
```

---

### Option 4: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose your repository

2. **Configure Build**
   - Build command: `pnpm build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://api.example.com
     NEXT_PUBLIC_APP_URL=https://portfolio.example.com
     ```

4. **Deploy**
   - Netlify automatically deploys on push

---

## Performance Optimization

### 1. CDN Configuration

For Cloudflare:
- Add your domain as a new site
- Update nameservers
- Enable caching for static assets
- Setup SSL/TLS

### 2. Image Optimization

Images are automatically optimized via Next.js. For Cloudflare R2:
- Images are cached by CDN
- Use Cloudflare Image Optimization (optional)

### 3. Database Query Optimization

- Ensure backend implements proper indexing
- Use pagination for large datasets
- Cache frequently accessed data

### 4. Bundle Size

Current optimizations:
- Code splitting (automatic)
- Tree shaking
- CSS optimization via Tailwind
- Component lazy loading

Monitor with:
```bash
pnpm build && pnpm analyze
```

---

## Monitoring & Logging

### Vercel Analytics

Vercel provides built-in analytics:
- Web Vitals
- Performance metrics
- Error tracking

### Error Tracking (Optional)

Add Sentry for production errors:

```bash
pnpm add @sentry/nextjs
```

Update `next.config.mjs`:
```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(nextConfig);
```

---

## Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf .next
pnpm install
pnpm build
```

### Memory Issues

Increase Node memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

### 404 on Routes

Ensure `.next` directory exists after build. For static export:

```bash
pnpm build
pnpm export
```

---

## Rollback

### Vercel
- Deployments tab → Select previous deployment → Redeploy

### Manual
```bash
git revert <commit-hash>
git push
# Redeploy
```

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Rate limiting enabled
- [ ] Input validation on frontend
- [ ] API authentication working
- [ ] Email authentication (mengkheykhorn@gmail.com only)

---

## Backup & Disaster Recovery

- Code backup: GitHub repository
- Database backup: Backend responsibility
- File backup: Cloudflare R2 versioning

---

## Scaling

For high traffic:
1. Use CDN for static assets
2. Enable caching on API responses
3. Use database read replicas
4. Consider serverless functions for specific endpoints
5. Implement rate limiting

---

## Support

For deployment issues, check:
- Vercel documentation: https://vercel.com/docs
- Next.js documentation: https://nextjs.org/docs
- GitHub Actions: https://docs.github.com/en/actions
