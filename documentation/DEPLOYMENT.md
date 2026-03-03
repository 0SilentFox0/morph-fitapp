# Deployment Guide

## GitHub

Repository: [github.com/0SilentFox0/Morph](https://github.com/0SilentFox0/Morph)

```bash
git remote -v   # origin → git@github.com:0SilentFox0/Morph.git
git push origin main
```

## Vercel (Web)

This Expo app supports web via `expo export -p web`. Vercel is configured to build and deploy the web build.

### Option A: Deploy via Vercel Dashboard (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New Project** → Import `0SilentFox0/Morph`.
3. Vercel auto-detects settings from `vercel.json`:
   - **Build Command:** `npx expo export -p web`
   - **Output Directory:** `dist`
4. Click **Deploy**. Future pushes to `main` will auto-deploy.

### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel          # deploy preview
vercel --prod   # deploy to production
```

### Local web build (test before deploy)

```bash
npm run export:web   # or: npx expo export -p web
# Output in dist/
```

## Mobile (iOS / Android)

Use [EAS Build](https://docs.expo.dev/build/introduction/) for native builds:

```bash
npx eas build --platform ios
npx eas build --platform android
```
