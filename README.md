# Speech Masking Generator - Web Application

**Browser-based Multi-Channel Speech Masking Signal Generator**

A modern web application for generating research-grade speech masking signals directly in your browser. Built with Next.js and deployed on Cloudflare Pages.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Signal Generation
- **4 Masking Channel Types**
  - Pink Noise (1/f spectrum)
  - Speech-Shaped Noise (formant-matched)
  - Multi-Talker Babble (6 voices)
  - Narrowband Maskers (critical bands)

### Professional Quality
- Sample rates: 44.1, 48, and 96 kHz
- 16-bit WAV export
- Mono and stereo output
- Individual channel level control (-20 to 0 dB)

### Browser-Based
- ✅ No server processing needed
- ✅ All generation happens in-browser using Web Audio API
- ✅ Fast, instant results
- ✅ Privacy-focused (no data sent to server)

### Modern UI
- Beautiful, responsive interface
- Real-time preview playback
- Progress indicators
- Mobile-friendly design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build static site
npm run build

# Preview locally
npm run preview
```

## 📦 Deployment to Cloudflare Pages

### Option 1: Automated Deployment

```bash
# Build and deploy
npm run deploy
```

### Option 2: Manual Deployment

1. **Build the application**
   ```bash
   npm run pages:build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   wrangler pages deploy
   ```

3. **Configure Custom Domain** (optional)
   - Go to Cloudflare Dashboard → Pages
   - Select your project
   - Add custom domain

### Option 3: GitHub Integration

1. Push code to GitHub
2. In Cloudflare Dashboard → Pages → Create Project
3. Connect GitHub repository
4. Build settings:
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `/`

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: R2 Storage for saving generated files
R2_BUCKET_NAME=speech-masking-audio

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-ga-id
```

### Wrangler Configuration

Edit `wrangler.toml` for Cloudflare settings:

```toml
name = "speech-masking-web"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

# Optional: R2 bucket for storage
[[r2_buckets]]
binding = "AUDIO_STORAGE"
bucket_name = "your-bucket-name"
```

## 🎵 Usage

### Basic Workflow

1. **Configure Settings**
   - Set duration (1-300 seconds)
   - Choose sample rate (44.1, 48, or 96 kHz)

2. **Enable Channels**
   - Toggle individual channels on/off
   - Adjust levels using sliders

3. **Generate Signal**
   - Click "Generate Signal"
   - Wait for processing (instant for <60s)

4. **Preview & Download**
   - Play preview in browser
   - Download mono or stereo WAV

### Advanced Features

#### Custom Channel Levels
Each channel can be adjusted independently:
- Drag sliders for -20 to 0 dB range
- Real-time percentage display
- Visual feedback with color coding

#### Stereo Export
Stereo version includes:
- Spatial decorrelation
- 0.5ms interaural time delay
- 45° phase shift for binaural effect

## 📚 Technical Details

### Architecture

```
┌─────────────────────────────────────┐
│        Next.js Frontend             │
│  (React + TypeScript + Tailwind)    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Web Audio API Engine           │
│  - Pink Noise Generator             │
│  - Formant Synthesis                │
│  - Biquad Filtering                 │
│  - WAV Encoder                      │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     Cloudflare Pages (Edge)         │
│  - Global CDN                       │
│  - Instant deployment               │
│  - Optional R2 storage              │
└─────────────────────────────────────┘
```

### Signal Processing

#### Pink Noise
- Algorithm: Voss-McCartney method
- 16 generators for smooth 1/f spectrum
- Normalized to 0.5 peak

#### Speech-Shaped Noise
- Formants: F1 (700 Hz), F2 (1220 Hz), F3 (2600 Hz)
- Biquad bandpass filters (Q: 5-17)
- 8 Hz syllabic modulation

#### Babble
- 6 independent voices
- Randomized formant frequencies (±15%)
- Variable amplitude per voice
- Natural temporal overlap

#### Narrowband Maskers
- 5 critical bands (250-3500 Hz)
- Weighted importance (mid frequencies boosted)
- Biquad filtering per band

### Performance

| Metric | Value |
|--------|-------|
| Generation Time (60s) | ~2-3 seconds |
| Memory Usage | ~50-100 MB |
| File Size (60s, 48kHz) | ~5-10 MB |
| Supported Duration | 1-300 seconds |

## 🛠️ Development

### Project Structure

```
speech-masking-web/
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Main page
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   │   ├── MaskingGenerator.tsx  # Main generator
│   │   ├── ChannelControl.tsx    # Channel controls
│   │   ├── Header.tsx            # App header
│   │   ├── Footer.tsx            # App footer
│   │   ├── Button.tsx            # Button component
│   │   └── Card.tsx              # Card component
│   └── lib/               # Libraries
│       ├── audioGenerator.ts     # Web Audio API
│       └── utils.ts              # Utilities
├── public/                # Static assets
├── worker/                # Cloudflare Workers (optional)
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── wrangler.toml         # Cloudflare config
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run pages:build  # Build for Cloudflare Pages
npm run preview      # Preview Pages build locally
npm run deploy       # Deploy to Cloudflare Pages
```

### Adding New Signal Types

1. Add generator method to `src/lib/audioGenerator.ts`:
   ```typescript
   generateCustomNoise(duration: number): Float32Array {
     // Your implementation
   }
   ```

2. Update channel types in `MaskingGenerator.tsx`:
   ```typescript
   { type: 'custom', enabled: true, level: -8, name: 'Custom' }
   ```

3. Add case to switch statement in `generateSignal()`

## 🌐 Cloudflare Integration

### R2 Storage (Optional)

To enable R2 storage for saving generated files:

1. **Create R2 Bucket**
   ```bash
   wrangler r2 bucket create speech-masking-audio
   ```

2. **Update wrangler.toml**
   ```toml
   [[r2_buckets]]
   binding = "AUDIO_STORAGE"
   bucket_name = "speech-masking-audio"
   ```

3. **Use in Worker**
   ```typescript
   // worker/index.ts
   export default {
     async fetch(request, env) {
       await env.AUDIO_STORAGE.put('file.wav', audioBlob)
     }
   }
   ```

### Analytics

Enable Cloudflare Web Analytics in the dashboard for:
- Page views
- User engagement
- Performance metrics

## 🔒 Security & Privacy

- **No Server Processing**: All audio generated client-side
- **No Data Collection**: Generated audio never leaves your browser
- **HTTPS Only**: Enforced by Cloudflare Pages
- **CSP Headers**: Content Security Policy enabled
- **CORS**: Configured for security

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Mobile Chrome | 60+ | ✅ Full |

**Required APIs:**
- Web Audio API
- AudioContext
- Blob/File API
- Download attribute support

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Audio Not Playing

- Check browser console for errors
- Ensure browser supports Web Audio API
- Try different browser
- Check system audio output

### Deployment Issues

```bash
# Verify Wrangler authentication
wrangler whoami

# Re-authenticate if needed
wrangler login

# Check project status
wrangler pages project list
```

## 🎓 Research Applications

Perfect for:
- Speech intelligibility testing
- Psychoacoustic experiments
- Hearing aid evaluation
- Acoustic booth validation
- Signal-to-noise ratio studies
- Cocktail party effect research

## 📄 License

MIT License - see LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📞 Support

- **Documentation**: See README.md
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🎯 Roadmap

- [ ] Save/Load configurations
- [ ] Batch generation
- [ ] Real-time waveform visualization
- [ ] Custom formant frequencies
- [ ] Variable number of voices
- [ ] Spectral analysis view
- [ ] Share via URL
- [ ] PWA support for offline use

## 🙏 Acknowledgments

- Web Audio API documentation
- Next.js team
- Cloudflare Pages platform
- Original Python implementation

---

**Built with ❤️ for research | Powered by Cloudflare**

*For the Python CLI version, see the `speech-masking-generator` directory*

