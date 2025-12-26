# 🚀 FREE Deployment Guide: Vercel + Neon

Deploy GRCma for **$0/month** using Vercel (hosting) + Neon (PostgreSQL database).

---

## Prerequisites

- ✅ GitHub account with your repo
- ✅ Clerk account (free tier works)
- ✅ DeepSeek or OpenAI API key (for AI features)

---

## Step 1: Create Neon Database (FREE)

### 1.1 Sign Up
1. Go to **[neon.tech](https://neon.tech)**
2. Click **Sign Up** → Sign in with GitHub
3. Select **Free Tier** (no credit card required)

### 1.2 Create Project
1. Click **Create Project**
2. Configure:
   - **Project Name**: `grcma-db`
   - **Postgres Version**: 16
   - **Region**: Choose nearest to your users (e.g., `US East`)
3. Click **Create Project**

### 1.3 Get Connection String
1. Once created, you'll see the **Connection Details**
2. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. **Save this** - you'll need it for Vercel

---

## Step 2: Deploy to Vercel (FREE)

### 2.1 Sign Up
1. Go to **[vercel.com](https://vercel.com)**
2. Click **Sign Up** → **Continue with GitHub**

### 2.2 Import Project
1. Click **Add New...** → **Project**
2. Find your repo: `muhammad23dz/GRCma-case-study-generator`
3. Click **Import**

### 2.3 Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave default)
3. **Build Command**: Leave empty (uses default)
4. **Output Directory**: Leave empty (uses default)

### 2.4 Add Environment Variables
Click **Environment Variables** and add these:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://...@neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from Clerk) |
| `CLERK_SECRET_KEY` | `sk_live_...` (from Clerk) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/platform` |
| `DEEPSEEK_API_KEY` | `sk-...` (from DeepSeek) |
| `LLM_PROVIDER` | `deepseek` |
| `NODE_ENV` | `production` |

### 2.5 Deploy
1. Click **Deploy**
2. Wait 2-5 minutes for build
3. You'll get a URL like: `https://grcma.vercel.app`

---

## Step 3: Run Database Migration

After first deploy, initialize the database:

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.local

# Run migration locally (connects to Neon)
npx prisma db push
```

### Option B: Neon SQL Editor
1. Go to Neon Dashboard → **SQL Editor**
2. Copy your Prisma schema SQL and run it manually
3. (This is more complex - use Option A if possible)

---

## Step 4: Configure Clerk

### 4.1 Add Production Domain
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your app
3. Go to **Domains** → **Add Domain**
4. Add your Vercel URL: `https://grcma.vercel.app`

### 4.2 Get Production Keys
1. Go to **API Keys**
2. Copy **Publishable Key** and **Secret Key**
3. Make sure these are the **production** keys (not test)

---

## Step 5: Verify Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test sign up/sign in**: Should redirect correctly
3. **Generate assessment**: Go to `/platform`
4. **Check database**: Neon dashboard → Tables

---

## Environment Variables Summary

```env
# Database (from Neon)
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/platform

# AI Provider
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxx

# OR use OpenAI instead
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-xxxxx

# Environment
NODE_ENV=production
```

---

## Free Tier Limits

### Vercel Free
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ⚠️ Serverless function timeout: 10s

### Neon Free
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ 3 branches
- ✅ Autoscaling to zero (saves cost)
- ⚠️ Compute: 191 hours/month

---

## Custom Domain (Optional)

1. Go to Vercel → **Settings** → **Domains**
2. Add your domain: `grcma.yourdomain.com`
3. Add DNS records:
   ```
   Type: CNAME
   Name: grcma
   Value: cname.vercel-dns.com
   ```
4. SSL is automatic

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure `prisma generate` runs during build
- Verify all env variables are set

### Database Connection Error
- Check DATABASE_URL format
- Ensure `?sslmode=require` is included
- Neon may need 1-2 minutes to wake up (serverless)

### Clerk Not Working
- Verify domain is whitelisted in Clerk
- Use production keys, not test keys
- Check browser console for errors

### Slow First Request
- Neon serverless "wakes up" on first request
- Normal: 2-5 seconds for cold start
- Enable "Always On" in Neon for $0.01/month if needed

---

## Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel | Free | $0 |
| Neon | Free | $0 |
| Clerk | Free | $0 (up to 10k MAU) |
| **Total** | | **$0/month** ✅ |

---

## Quick Reference

**Your URLs:**
- App: `https://grcma-xxx.vercel.app`
- Neon Dashboard: `https://console.neon.tech`
- Vercel Dashboard: `https://vercel.com/dashboard`
- Clerk Dashboard: `https://dashboard.clerk.com`

**Deploy Command:**
```bash
git push origin main  # Auto-deploys on Vercel
```

---

## Upgrade Path

When you outgrow free tier:

| Need | Solution | Cost |
|------|----------|------|
| More DB storage | Neon Pro | $19/mo |
| Faster functions | Vercel Pro | $20/mo |
| Team features | Vercel Team | $20/user |

---

*Vercel + Neon Deployment Guide v1.0 - GRCma Platform*
