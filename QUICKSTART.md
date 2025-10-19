# Quick Start Guide

Get your Speech Masking Generator web app running in 5 minutes.

---

## 🚀 Local Development (3 steps)

### Step 1: Install Dependencies

```bash
cd speech-masking-web
npm install
```

**Time:** ~2 minutes

### Step 2: Run Development Server

```bash
npm run dev
```

**Time:** ~10 seconds

### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

**Done!** The app is now running locally.

---

## ☁️ Deploy to Cloudflare Pages (3 steps)

### Step 1: Build for Production

```bash
npm run pages:build
```

### Step 2: Deploy

```bash
npm run deploy
```

Follow the prompts to:
- Log in to Cloudflare (first time only)
- Select/create project name
- Confirm deployment

### Step 3: Visit Your Site

Your app will be live at:
```
https://your-project-name.pages.dev
```

**Time:** ~3-5 minutes total

---

## 🎵 Using the App

### Basic Workflow

1. **Configure**
   - Set duration (1-300 seconds)
   - Choose sample rate (44.1, 48, or 96 kHz)

2. **Enable Channels**
   - Toggle channels on/off
   - Adjust levels with sliders

3. **Generate**
   - Click "Generate Signal"
   - Wait a few seconds

4. **Download**
   - Preview with "Play"
   - Download mono or stereo WAV

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Deployment
npm run pages:build      # Build for Cloudflare Pages
npm run preview          # Preview Pages build locally
npm run deploy           # Deploy to Cloudflare

# Maintenance
npm run lint             # Run linter
npm install              # Install/update dependencies
```

---

## 📁 Project Structure

```
speech-masking-web/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   └── lib/              # Core logic
├── public/               # Static files
├── package.json          # Dependencies
└── wrangler.toml        # Cloudflare config
```

---

## 🐛 Quick Troubleshooting

### App won't start

```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Build errors

```bash
npm install
npm run pages:build
```

### Deploy fails

```bash
wrangler login
npm run deploy
```

---

## 📚 Next Steps

- **Customize**: Edit `src/components/MaskingGenerator.tsx`
- **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Learn More**: See [README.md](README.md)

---

**That's it! You're ready to generate speech masking signals in the browser.** 🎉

