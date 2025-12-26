# 🚀 DigitalOcean Deployment Guide for GRCma

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub repository: `https://github.com/muhammad23dz/GRCma-case-study-generator`
- ✅ DigitalOcean account (with billing enabled)
- ✅ Clerk account for authentication
- ✅ OpenAI/DeepSeek API key for AI features
- ✅ (Optional) Custom domain name

---

## Step 1: Create DigitalOcean Database (PostgreSQL)

1. **Log in to DigitalOcean** → Go to **Databases**
2. Click **Create Database Cluster**
3. Configure:
   - **Database Engine**: PostgreSQL 16
   - **Cluster Plan**: Basic ($15/mo) or higher
   - **Datacenter**: Choose nearest to your users
   - **Cluster Name**: `grcma-db`
4. Click **Create Database Cluster** (takes ~5 minutes)
5. Once ready, go to **Connection Details** and copy:
   ```
   host: your-db-host.db.ondigitalocean.com
   port: 25060
   user: doadmin
   password: your-password
   database: defaultdb
   sslmode: require
   ```

6. **Build your DATABASE_URL**:
   ```
   postgresql://doadmin:your-password@your-db-host.db.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```

---

## Step 2: Create DigitalOcean App Platform App

1. Go to **Apps** → Click **Create App**
2. Select **GitHub** as source
3. **Authorize DigitalOcean** to access your GitHub
4. Select repository: `muhammad23dz/GRCma-case-study-generator`
5. Select branch: `main`
6. Click **Next**

---

## Step 3: Configure App Settings

### Resources:
- **Type**: Web Service
- **Resource Size**: Basic ($5/mo) or Professional ($12/mo for production)
- **Instance Count**: 1

### Build Command:
```bash
npm install && npx prisma generate && npm run build
```

### Run Command:
```bash
npm start
```

### HTTP Port:
```
3000
```

---

## Step 4: Set Environment Variables

Go to **Settings** → **App-Level Environment Variables** and add:

| Variable | Value | Encrypt |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://doadmin:PASSWORD@HOST:25060/defaultdb?sslmode=require` | ✅ Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from Clerk Dashboard) | No |
| `CLERK_SECRET_KEY` | `sk_live_...` (from Clerk Dashboard) | ✅ Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | No |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | No |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | No |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/platform` | No |
| `OPENAI_API_KEY` | `sk-...` (if using OpenAI) | ✅ Yes |
| `DEEPSEEK_API_KEY` | `sk-...` (if using DeepSeek) | ✅ Yes |
| `LLM_PROVIDER` | `deepseek` or `openai` | No |
| `NODE_ENV` | `production` | No |

---

## Step 5: Configure Clerk for Production

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** → Copy production keys
4. Go to **Domains** → Add your DigitalOcean app URL:
   ```
   https://your-app-xxxxx.ondigitalocean.app
   ```
5. (Optional) Add custom domain if you have one

---

## Step 6: Deploy the App

1. Click **Review** → **Create Resources**
2. Wait for build to complete (5-10 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://grcma-xxxxx.ondigitalocean.app
   ```

---

## Step 7: Run Database Migrations

After first deploy, you need to run Prisma migrations:

### Option A: Using DigitalOcean Console
1. Go to your App → **Console**
2. Run:
   ```bash
   npx prisma db push
   ```

### Option B: Add to Build Command
Update your build command to include migrations:
```bash
npm install && npx prisma generate && npx prisma db push && npm run build
```

---

## Step 8: Verify Deployment

1. **Visit your app URL**: `https://your-app.ondigitalocean.app`
2. **Test authentication**: Sign up/Sign in via Clerk
3. **Generate an assessment**: Go to `/platform`
4. **Check database**: Verify data in DigitalOcean database console

---

## Step 9: (Optional) Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `grcma.yourdomain.com`
4. Add DNS records to your domain provider:
   ```
   Type: CNAME
   Host: grcma
   Value: your-app-xxxxx.ondigitalocean.app
   ```
5. Enable **SSL** (automatic via Let's Encrypt)

---

## Cost Estimate

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| App Platform | Basic | $5-12 |
| PostgreSQL | Basic | $15 |
| **Total** | | **$20-27/mo** |

---

## Troubleshooting

### Build Fails
- Check build logs in DigitalOcean console
- Ensure all environment variables are set
- Verify `package.json` has correct build script

### Database Connection Error
- Verify DATABASE_URL format
- Check that `?sslmode=require` is included
- Ensure your database is in the same region

### Clerk Auth Not Working
- Verify Clerk domain whitelist includes your app URL
- Check both PUBLISHABLE_KEY and SECRET_KEY are set
- Ensure production keys (not test keys) are used

### 500 Errors
- Check runtime logs in DigitalOcean console
- Verify Prisma client was generated during build
- Check for missing environment variables

---

## Quick Reference

**Your App URL**: `https://grcma-xxxxx.ondigitalocean.app`

**GitHub Repo**: `https://github.com/muhammad23dz/GRCma-case-study-generator`

**Key Commands**:
```bash
# Local development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database migrations
npx prisma db push
```

---

## Support

If you encounter issues:
1. Check DigitalOcean App logs
2. Verify all environment variables
3. Test Clerk webhook integration
4. Review GitHub Actions (if using CI/CD)

---

*Deployment Guide v1.0 - GRCma Platform*
