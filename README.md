# GRCma Platform

<p align="center">
  <img src="public/logo.png" alt="GRCma Logo" width="120" />
</p>

<h3 align="center">Enterprise Governance, Risk & Compliance Platform</h3>

<p align="center">
  <strong>🚀 AI-Powered GRC Assessment & Management</strong>
</p>

---

## ✨ Core Features

### 🤖 AI-Powered Assessment Generation
- **Intelligent Analysis** - Generate comprehensive GRC assessments using AI
- **Multi-Framework Support** - ISO 27001, NIST CSF, SOC 2, GDPR, PCI DSS
- **Push to Dashboard** - Instantly sync generated data to your GRC modules
- **Executive Summaries** - AI-generated problem statements and recommendations

### 📊 Unified Dashboard
- **Real-Time KPIs** - Compliance score, risk counts, control status
- **Quick Navigation Hub** - One-click access to all GRC modules
- **Risk Heatmap** - Visual risk mapping by likelihood and impact
- **Delete All Data** - Bulk data management for testing/reset

### 🛡️ Governance
- **Policy Management** - Create, version, and track security policies
- **Control Library** - Manage controls with framework mapping
- **Framework Mapping** - Link controls to compliance requirements

### ⚠️ Risk Management  
- **Risk Register** - Identify, assess, and treat enterprise risks
- **Vendor Risk Management** - Third-party assessments with criticality scoring
- **Gap Analysis** - Compliance coverage visualization

### ✅ Compliance
- **Audit Management** - Plan audits, track findings, test controls
- **Evidence Collection** - Upload and organize audit evidence
- **Compliance Reporting** - PDF, CSV, Excel exports

### 🚨 Operations
- **Incident Management** - Track and respond to security incidents
- **Change Management** - CAB workflows and approvals
- **Action Tracking** - Remediation and improvement tracking

### 👥 Workforce
- **Employee Directory** - Track employee compliance status
- **Training Management** - Assign and track security training

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    GRCma Data Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Generate Assessment (/platform)                         │
│     └── Enter company details + framework                   │
│                                                             │
│  2. AI Generates GRC Data                                   │
│     └── Controls, Risks, Vendors, Incidents, Policies       │
│                                                             │
│  3. Push to Dashboard                                       │
│     └── Data saved to PostgreSQL via Prisma                 │
│                                                             │
│  4. Dashboard Updates                                       │
│     └── Real-time widgets show new counts                   │
│                                                             │
│  5. Manage Modules                                          │
│     └── CRUD operations on each GRC entity                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📍 Key Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Central hub with KPIs and navigation |
| Generate Assessment | `/platform` | AI-powered assessment generator |
| Saved Assessments | `/assessments` | View and push saved reports |
| Controls | `/controls` | Manage security controls |
| Risks | `/risks` | Risk register |
| Incidents | `/incidents` | Incident management |
| Employees | `/employees` | Workforce directory |
| Reports | `/reports` | Export PDF/CSV/Excel |
| User Guide | `/guide` | Step-by-step walkthrough |

---

## 📖 User Guide

New to GRCma? Visit `/guide` for a step-by-step walkthrough for GRC analysts.

---

## 🌐 Deployment

See [DEPLOY.md](./DEPLOY.md) for full deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/grcma-platform)

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Authentication
- `DEEPSEEK_API_KEY` - AI generation (optional)

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Demo** | FREE | All features - Evaluation period |
| **Professional** | Coming Soon | Full support + SLA |
| **Enterprise** | Coming Soon | Custom deployment + SSO |

---

## 🔒 Security

- AES-256 encryption at rest
- TLS 1.3 in transit
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Complete audit logging

Visit `/trust` for our full security and compliance information.

---

## 📧 Support

- **Email**: support@grcma.io
- **Documentation**: `/guide`
- **Security Issues**: security@grcma.io

---

## 📜 License

Copyright © 2024 GRCma. All rights reserved.

This demo is provided for evaluation purposes only.

---

<p align="center">
  Built with ❤️ using Next.js, Prisma, and Tailwind CSS
</p>
