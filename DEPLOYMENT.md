# Deployment Guide - Compliance Management Platform

## Production Deployment Steps

### 1. Vercel Deployment

1. **Install Vercel CLI** (already done):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Choose your preferred authentication method.

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   Follow the prompts:
   - Set up and deploy? Y
   - Which scope? (Your username/team)
   - Link to existing project? N
   - Project name: compliance-mvp
   - Directory: ./
   - Override settings? N

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings → Environment Variables
   - Add all environment variables from `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
     ```

### 2. Firebase Configuration

1. **Deploy Firestore Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Configure Firebase Auth Domain**:
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to Authorized domains:
     - `your-domain.vercel.app`

3. **Configure Firebase Storage CORS**:
   ```bash
   gsutil cors set cors.json gs://your-storage-bucket
   ```

### 3. Production Checklist

- [x] Firebase Security Rules deployed
- [x] Application builds successfully
- [ ] Environment variables configured in Vercel
- [ ] Firebase authorized domains updated
- [ ] Storage CORS configured
- [ ] Demo data populated in Firestore
- [ ] Admin account created
- [ ] User workflows tested

### 4. Post-Deployment Testing

1. **Create Admin Account**:
   - Visit: `https://your-domain.vercel.app/setup-admin`
   - Create admin account: `admin@demo.com / Admin123!`

2. **Test User Workflows**:
   - Admin: Create advisors and subcontractors
   - Advisor: View assigned projects
   - Subcontractor: Submit monthly reports

3. **Verify Security**:
   - Test role-based access control
   - Verify file upload permissions
   - Check data isolation between users

### 5. Demo Accounts

**Admin:**
- Email: `admin@demo.com`
- Password: `Admin123!`

**Advisors:**
- Email: `alice@advisor.com` / Password: `Advisor123!`
- Email: `bob@advisor.com` / Password: `Advisor123!`

**Subcontractors:**
- Email: `apex@construction.com` / Password: `Sub123!`
- Email: `stark@electrical.com` / Password: `Sub123!`
- Email: `wayne@plumbing.com` / Password: `Sub123!`

### 6. Production Monitoring

- Monitor Firebase Usage in Firebase Console
- Check Vercel Analytics for performance
- Review Firebase Auth logs for security
- Monitor Storage usage and costs

## Support and Maintenance

For ongoing support:
1. Monitor Firebase quotas and billing
2. Review security rules quarterly
3. Update dependencies regularly
4. Backup Firestore data monthly
5. Test disaster recovery procedures

## Environment Variables Reference

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```