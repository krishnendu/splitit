# Deployment Guide - GitHub Pages & PWA

## 🚀 GitHub Pages Deployment

### Option 1: Automated Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

**Steps:**
1. Push your code to GitHub repository
2. Go to repository **Settings → Pages**
3. Under "Source", select **"GitHub Actions"** (not "Deploy from a branch")
4. The workflow will automatically build and deploy on every push to `main`
5. Your app will be available at: `https://krishnendu.github.io/splitit`

### Option 2: Manual Deployment

1. **Update package.json homepage** (already set):
   ```json
   "homepage": "https://krishnendu.github.io/splitit"
   ```

2. **Install gh-pages** (already in package.json):
   ```bash
   npm install
   ```

3. **Build and deploy**:
   ```bash
   npm run deploy
   ```

This will:
- Build the app with the correct base path
- Deploy to the `gh-pages` branch
- Make it available at `https://YOUR_USERNAME.github.io/splitit`

## 📱 PWA Configuration

### Features Enabled:
- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for installation
- ✅ Install prompt for users
- ✅ App icons (192x192 and 512x512)
- ✅ Standalone display mode
- ✅ Offline caching

### Adding App Icons

You need to create actual icon files:

1. **Create icons** (192x192 and 512x512 PNG):
   - Use a design tool (Figma, Canva, etc.)
   - Export as PNG with transparent background
   - Recommended: Square icon with rounded corners

2. **Place icons** in `public/`:
   - `public/icon-192x192.png`
   - `public/icon-512x512.png`
   - `public/favicon.ico` (32x32 or 16x16)

3. **Icon design tips**:
   - Use the app's primary color (#0ea5e9)
   - Include a simple logo or "S" for SplitIt
   - Ensure icons are clear at small sizes
   - Test on both light and dark backgrounds

### Testing PWA

1. **Local testing**:
   ```bash
   npm run build
   npm run preview
   ```
   - Open Chrome DevTools → Application → Service Workers
   - Check "Offline" to test offline mode
   - Go to Application → Manifest to verify manifest

2. **Installation testing**:
   - Build and serve locally or deploy
   - Open in Chrome/Edge
   - Look for install prompt or use browser menu
   - On mobile: Use "Add to Home Screen"

3. **Lighthouse PWA audit**:
   - Open Chrome DevTools → Lighthouse
   - Run PWA audit
   - Should score 100/100 for PWA

## 🔧 Configuration

### Base Path for GitHub Pages

The build script automatically sets the base path to `/splitit/` for GitHub Pages. If your repository name is different, update:

1. `vite.config.ts` - Change base path
2. `package.json` - Update homepage and build:gh-pages script
3. `.github/workflows/deploy.yml` - Update base path in build step

### Environment Variables

For production, you might want to set:
- `VITE_APP_VERSION` - App version
- `VITE_APP_NAME` - App name

Add to `.env.production`:
```
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=SplitIt
```

## 📋 Pre-Deployment Checklist

- [ ] Update `package.json` homepage with your GitHub username
- [ ] Create and add app icons (192x192, 512x512, favicon)
- [ ] Test build locally: `npm run build:gh-pages`
- [ ] Test PWA installation locally
- [ ] Verify all routes work with base path
- [ ] Test offline functionality
- [ ] Run Lighthouse PWA audit
- [ ] Update README with deployment URL

## 🐛 Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `sw.js` is in `public/` folder
- Check that HTTPS is used (required for service workers)

### Icons Not Showing
- Verify icon files exist in `public/`
- Check manifest.json paths are correct
- Clear browser cache

### Routes Not Working on GitHub Pages
- Ensure base path is set correctly
- Use `Link` from react-router-dom, not `<a>` tags
- Check that all routes use relative paths

### Build Fails
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+)
- Clear `node_modules` and reinstall if needed

## 📱 Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Customize name if needed
5. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Install app" or "Add to Home screen"
4. Confirm installation

## 🔄 Updating the App

After deployment, users will automatically get updates:
- Service worker checks for updates on each visit
- New version prompts user to reload
- Cached assets are updated automatically

## 📊 Monitoring

Consider adding:
- Analytics (Google Analytics, Plausible)
- Error tracking (Sentry)
- Performance monitoring

## 🔒 Security

- All data stays in user's Google Sheet
- No backend = no server-side vulnerabilities
- OAuth credentials stored locally (user's responsibility)
- HTTPS required for PWA features
