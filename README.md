# Compliance Management Platform MVP

A comprehensive safety compliance tracking system for construction projects, built with Next.js 14, Firebase, and TypeScript.

## Features

### Admin Portal
- **User Management**: Create and manage advisors and subcontractors
- **Project Management**: Create projects and assign users
- **Analytics Dashboard**: Real-time compliance metrics and KPIs
- **System Overview**: Monitor platform usage and performance

### Advisor Portal
- **Project Oversight**: View assigned projects and subcontractors
- **Report Review**: Access and download monthly safety reports
- **Document Management**: Review uploaded compliance documents
- **Progress Tracking**: Monitor submission status and deadlines

### Subcontractor Portal
- **Monthly Reports**: Submit monthly safety metrics (11 required fields)
- **Document Upload**: Upload required monthly documents (5 types)
- **Annual Documents**: Manage annual compliance documents (18 types)
- **Submission History**: Track past submissions and compliance status

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project configured
- Vercel account (for deployment)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd compliance-mvp
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your Firebase configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open http://localhost:3000**

### Initial Setup

1. **Create Firebase project** with Authentication, Firestore, and Storage
2. **Deploy security rules**: `firebase deploy --only firestore:rules`
3. **Create admin account**: Visit `/setup-admin`
4. **Configure users and projects** through admin portal

## Demo Accounts

**Admin:**
- Email: `admin@demo.com`
- Password: `Admin123!`

**Advisor:**
- Email: `alice@advisor.com`
- Password: `Advisor123!`

**Subcontractor:**
- Email: `apex@construction.com`
- Password: `Sub123!`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy with Vercel CLI**:
   ```bash
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard

4. **Update Firebase authorized domains**