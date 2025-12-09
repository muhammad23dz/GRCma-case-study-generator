# GRCma Platform

A modern, AI-powered Governance, Risk, and Compliance (GRC) management platform built with Next.js, Prisma, and DeepSeek AI.

## Features

- 🎯 **AI-Powered Case Study Generator** - Generate comprehensive GRC assessments using DeepSeek AI
- 📊 **Interactive Dashboard** - Real-time compliance metrics and risk visualization
- 🔒 **Control Library** - Comprehensive security control management
- ⚠️ **Risk Management** - Track and assess organizational risks
- 📋 **Action Tracking** - Monitor remediation tasks and compliance actions
- 🏢 **Vendor Management** - Third-party risk assessment and tracking
- 📚 **Framework Mapping** - Map controls to multiple compliance frameworks (ISO 27001, SOC 2, NIST, etc.)
- 🔐 **Google OAuth Authentication** - Secure user authentication
- 🎨 **Premium UI** - Modern, glassmorphic design with smooth animations

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **AI**: DeepSeek API for intelligent report generation
- **Authentication**: NextAuth.js with Google OAuth
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- DeepSeek API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ncc-grc-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# DeepSeek API
DEEPSEEK_API_KEY="your-deepseek-api-key"
```

4. Initialize the database:
```bash
npx prisma db push
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ncc-grc-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── risks/            # Risk management
│   ├── controls/         # Control library
│   ├── actions/          # Action tracking
│   ├── vendors/          # Vendor management
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Key Features Explained

### AI Case Study Generator
Generate comprehensive GRC assessments by providing:
- Company name and size
- Target compliance framework
- Key challenges

The AI generates:
- Executive summary
- Risk analysis
- Control recommendations
- Vendor assessments
- Strategic roadmap

### Multi-Framework Support
Map your controls to multiple frameworks:
- ISO 27001:2022
- SOC 2
- NIST CSF
- GDPR
- PCI DSS
- HIPAA

### Real-Time Dashboard
Monitor your GRC posture with:
- Compliance score
- Critical risk count
- Open action items
- Recent activity feed

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control. It contains sensitive API keys and secrets.

The `.gitignore` file is configured to exclude:
- `.env` and all `.env.*` files
- Database files
- Node modules
- Build artifacts

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved

## Support

For setup assistance, refer to `GOOGLE_OAUTH_SETUP.md` in the project root.
