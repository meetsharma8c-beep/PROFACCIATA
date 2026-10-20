# Deploying PROFACCIATA to Vercel

The PROFACCIATA architectural website is built with **TanStack Start**, **React 19**, and **Nitro**, fully configured for deployment on Vercel.

---

## Method 1: Deploy via Vercel CLI (Fastest)

If you have the Vercel CLI installed (or via `npx`):

```bash
# 1. Navigate to the app directory
cd app

# 2. Run Vercel CLI deploy
npx vercel
```

Follow the prompts:
- **Set up and deploy?** `Y`
- **Which scope?** (Select your account)
- **Link to existing project?** `N`
- **What's your project's name?** `profacciata` (or your preferred name)
- **In which directory is your code located?** `./` (since you are inside `app`)
- **Want to modify build settings?** `N` (Nitro and TanStack Start will automatically generate `.vercel/output`)

For production deployment:
```bash
npx vercel --prod
```

---

## Method 2: Deploy via Git & Vercel Dashboard

1. **Push your repository to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure PROFACCIATA for Vercel deployment"
   git push origin master
   ```

2. **Open the [Vercel Dashboard](https://vercel.com/)**:
   - Click **Add New** > **Project**.
   - Import your PROFACCIATA repository.

3. **Configure Project Settings**:
   - **Root Directory**: Click *Edit* and select **`app`** (Important!).
   - **Framework Preset**: `TanStack Start` or `Other` (detected automatically via `app/vercel.json`).
   - **Build Command**: `bun run build` or `node scripts/check-ui.mjs && tsr generate && tsc --noEmit && vite build`.
   - **Install Command**: `bun install` or `npm install`.

4. **Click Deploy**:
   Vercel will compile the assets and serverless functions into `.vercel/output` and serve the site with global CDN edge caching.
