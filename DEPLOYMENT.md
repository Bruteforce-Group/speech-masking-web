# Deployment Guide

Complete guide to deploying Speech Masking Generator to Cloudflare Pages.

---

## 🚀 Quick Deploy (3 methods)

### Method 1: Direct Deploy (Fastest)

```bash
# 1. Install dependencies
npm install

# 2. Build and deploy in one command
npm run deploy

# Follow the prompts to:
# - Log in to Cloudflare (first time only)
# - Select/create project
# - Confirm deployment
```

**Done!** Your app will be live at `https://your-project.pages.dev`

---

### Method 2: GitHub Integration (Recommended for Production)

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/speech-masking-web.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create Application** → **Pages**
3. Click **Connect to Git**
4. Select your GitHub repository
5. Configure build settings:
   ```
   Build command: npm run pages:build
   Build output directory: .vercel/output/static
   Root directory: /
   ```
6. Click **Save and Deploy**

#### Step 3: Configure Custom Domain (Optional)

1. In your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `masking.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (1-5 minutes)

**Benefits:**
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
- ✅ Rollback capability
- ✅ Build logs and history

---

### Method 3: Manual CLI Deploy

#### Step 1: Install Wrangler

```bash
npm install -g wrangler

# Or use npx
npx wrangler --version
```

#### Step 2: Authenticate

```bash
wrangler login

# This opens browser to authenticate with Cloudflare
# Follow the prompts and authorize
```

#### Step 3: Build Application

```bash
npm run pages:build
```

#### Step 4: Deploy

```bash
wrangler pages deploy

# Follow prompts:
# - Enter project name
# - Confirm deployment
```

#### Step 5: View Deployment

```bash
# Get project URL
wrangler pages project list

# View specific deployment
wrangler pages deployment list <project-name>
```

---

## 🔧 Advanced Configuration

### Environment Variables

#### For Development

Create `.env.local`:

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_R2=false
```

#### For Production (Cloudflare Pages)

1. Go to Pages project → **Settings** → **Environment variables**
2. Add variables:
   - `NEXT_PUBLIC_GA_ID`: Your Google Analytics ID
   - `NODE_VERSION`: `18` (recommended)

### Custom Build Command

Edit `wrangler.toml`:

```toml
[build]
command = "npm run pages:build"
cwd = "."

[build.upload]
format = "directory"
dir = ".vercel/output/static"
```

### R2 Storage Integration

#### Create R2 Bucket

```bash
wrangler r2 bucket create speech-masking-audio
```

#### Update wrangler.toml

```toml
[[r2_buckets]]
binding = "AUDIO_STORAGE"
bucket_name = "speech-masking-audio"
```

#### Create Worker for R2

Create `worker/index.ts`:

```typescript
export interface Env {
  AUDIO_STORAGE: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (request.method === 'POST' && url.pathname === '/api/save') {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response('No file provided', { status: 400 });
      }
      
      const key = `${Date.now()}-${file.name}`;
      await env.AUDIO_STORAGE.put(key, file);
      
      return new Response(JSON.stringify({ key }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (request.method === 'GET' && url.pathname.startsWith('/api/files/')) {
      const key = url.pathname.replace('/api/files/', '');
      const object = await env.AUDIO_STORAGE.get(key);
      
      if (!object) {
        return new Response('Not found', { status: 404 });
      }
      
      return new Response(object.body, {
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Disposition': `attachment; filename="${key}"`,
        },
      });
    }
    
    return new Response('Not found', { status: 404 });
  },
};
```

Deploy worker:

```bash
wrangler deploy worker/index.ts
```

---

## 🌐 Custom Domain Setup

### Option 1: Cloudflare Registered Domain

1. **Add domain to Pages**
   ```bash
   wrangler pages domain add <your-domain.com>
   ```

2. **Configure DNS** (automatic if domain on Cloudflare)

3. **Wait for SSL** (~5 minutes)

### Option 2: External Domain

1. **Add CNAME record to your DNS provider:**
   ```
   Type: CNAME
   Name: masking (or @)
   Value: your-project.pages.dev
   ```

2. **Add domain in Cloudflare Pages UI**

3. **Wait for verification**

---

## 📊 Performance Optimization

### Enable Caching

Add to `next.config.js`:

```javascript
module.exports = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Enable Compression

Cloudflare automatically enables Brotli compression. No configuration needed!

### Enable Minification

Update `next.config.js`:

```javascript
module.exports = {
  // ... existing config
  swcMinify: true,
  compress: true,
};
```

---

## 🔒 Security Best Practices

### Content Security Policy

Create `middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:;"
  );
  
  return response;
}
```

### Enable HTTPS Only

In Cloudflare Dashboard:
1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable **Always Use HTTPS**
3. Enable **Automatic HTTPS Rewrites**

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf .next node_modules
npm install
npm run pages:build
```

### Deployment Fails

```bash
# Check authentication
wrangler whoami

# Re-authenticate
wrangler logout
wrangler login

# Try again
npm run deploy
```

### "Module not found" Error

```bash
# Ensure all dependencies installed
npm install

# Check package.json for missing deps
npm list
```

### Custom Domain Not Working

1. Check DNS propagation: `dig yourdomain.com`
2. Wait 24-48 hours for full propagation
3. Check SSL certificate status in Cloudflare
4. Verify CNAME points to `*.pages.dev`

---

## 📈 Monitoring & Analytics

### Cloudflare Web Analytics

1. Go to **Web Analytics** in Cloudflare Dashboard
2. Click **Add a site**
3. Copy the beacon script
4. Add to `src/app/layout.tsx`:

```tsx
<Script
  defer
  src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "your-token"}'
/>
```

### Google Analytics (Optional)

1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

2. Create `src/app/analytics.tsx`:
   ```tsx
   'use client';
   import Script from 'next/script';
   
   export function Analytics() {
     const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
     return GA_ID ? (
       <>
         <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
         <Script id="google-analytics">
           {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${GA_ID}');
           `}
         </Script>
       </>
     ) : null;
   }
   ```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm ci
      - run: npm run pages:build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: speech-masking-web
          directory: .vercel/output/static
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

## ✅ Post-Deployment Checklist

- [ ] App loads successfully
- [ ] All 4 channels generate correctly
- [ ] Audio playback works
- [ ] Download (mono & stereo) works
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics tracking (if enabled)
- [ ] Error tracking configured
- [ ] Performance metrics acceptable

---

## 📞 Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Next.js Docs**: https://nextjs.org/docs
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler
- **GitHub Issues**: For bug reports

---

**Deployment complete! Your app is now live on Cloudflare's global edge network.** 🎉

