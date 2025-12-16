# GRCma Deployment Guide

## Prerequisites

- Node.js 18+
- Git
- Vercel account (free tier works)
- Neon database account (free tier works)
- Clerk account (free tier works)

## Environment Variables

Create these environment variables in your deployment platform:

### Required

```env
# Database (Neon)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Optional (LLM - for AI features)

```env
# GitHub Models (free) - recommended
GITHUB_TOKEN=github_pat_...

# Or use DeepSeek (cheap)
# DEEPSEEK_API_KEY=sk-...

# Or use OpenAI (paid)
# OPENAI_API_KEY=sk-...
```

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "GRCma Platform - Production Ready"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`
5. Add Environment Variables (from above)
6. Click "Deploy"

### 3. Database Setup

After first deployment:

```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

## Post-Deployment

### Configure Clerk

1. Go to Clerk Dashboard → Settings → Domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Update OAuth redirect URIs if using social login

### Test the Platform

1. Visit your deployed URL
2. Sign up for an account
3. Go to Platform → Generate an assessment
4. Click "Push to Dashboard" to populate data
5. Explore the Dashboard, Controls, Risks, etc.

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` uses `?sslmode=require`
- Check Neon dashboard for connection pooling settings

### Auth Not Working
- Verify Clerk keys match your environment
- Check domain is added in Clerk dashboard

### LLM Errors
- Platform works without LLM (uses fallback data)
- Add valid API key when ready for AI features

## Architecture

```
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Main dashboard
│   ├── platform/       # Assessment generator
│   └── ...
├── components/         # React components
├── lib/               # Utilities & services
│   ├── llm/           # LLM service
│   └── prisma.ts      # Database client
├── prisma/            # Database schema
└── types/             # TypeScript types
```

## Features

- ✅ Dashboard with real-time GRC metrics
- ✅ Controls Management (CRUD + mapping)
- ✅ Risk Assessment & Heatmap
- ✅ Vendor Management
- ✅ Incident Tracking
- ✅ Policy Management
- ✅ AI-powered Assessment Generator
- ✅ Multi-framework support (ISO 27001, SOC 2, NIST, etc.)
- ✅ Audit logging
- ✅ Role-based access control

## Support

For issues, create a GitHub issue or contact the maintainer.
