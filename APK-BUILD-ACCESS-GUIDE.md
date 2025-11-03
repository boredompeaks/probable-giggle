# 🚀 V5 Chat Vault - APK Build & Access Guide

Complete guide for building and accessing your V5 Chat Vault Android APK using GitHub Actions.

## 🎯 Quick Start

### Prerequisites
1. ✅ **Repository secrets configured** (see `GITHUB-SECRETS-SETUP.md`)
2. ✅ **Expo account access** (Uzairmalkaniuzuz@gmail.com)
3. ✅ **Project ID:** `a302e6c7-9320-4966-ab5b-110c210c81d2`

## 🏗️ Build Methods

### Method 1: Quick Build (Recommended)
**Best for:** One-time builds, testing, quick iterations

1. **Navigate to Actions:**
   ```
   https://github.com/USERNAME/REPO-NAME/actions
   ```

2. **Select "Quick Android Build":**
   - Click on "Quick Android Build" workflow
   - Click "Run workflow"

3. **Configure Build:**
   ```
   Build type: preview (recommended for testing)
   Branch: leave empty (uses current branch)
   Message: optional (for build notes)
   ```

4. **Start Build:**
   - Click green "Run workflow" button
   - Wait for build to start (usually 1-2 minutes)

### Method 2: Full Build Pipeline
**Best for:** Automated builds, push notifications

**Automatic Triggers:**
- ✅ **Push to main/master/develop branches**
- ✅ **Pull requests to main branch**
- ✅ **Changes in critical files** (app, src, components, *.tsx, *.ts, app.json, eas.json, package.json)

**Manual Trigger:**
- Go to "Build Android APK" workflow
- Click "Run workflow"
- Choose build type and branch
- Click "Run workflow"

### Method 3: Branch-Specific Builds
**Best for:** Feature branches, testing specific changes

1. Navigate to Actions tab
2. Select "Build Android APK"
3. Click "Run workflow"
4. Choose your branch from dropdown
5. Select build type (preview/production/development)
6. Add optional message
7. Click "Run workflow"

## 📱 APK Build Profiles

| Profile | Purpose | When to Use | Download Access |
|---------|---------|-------------|----------------|
| **preview** | Internal testing | Most common use case | ✅ Expo internal distribution |
| **production** | Final releases | When ready for users | ✅ Production-ready |
| **development** | Debug builds | For development testing | ✅ Development builds |

## 🔍 Build Status Monitoring

### During Build
1. **Check Build Progress:**
   ```
   GitHub Repository > Actions > [Your Build] > Job Details
   ```

2. **Common Build Stages:**
   - ✅ Checkout repository
   - ✅ Setup Node.js
   - ✅ Install EAS CLI
   - ✅ Cache dependencies
   - 🔄 Authenticate with EAS
   - 🔄 Start EAS Build
   - ✅ Build Complete

3. **EAS Build URL:**
   ```
   https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2
   ```

### Build Duration
- **Preview builds:** 8-15 minutes
- **Production builds:** 10-20 minutes
- **Development builds:** 10-15 minutes

## 📥 Downloading Your APK

### Option 1: Direct Download (Preview)
1. **Wait for build completion** (green checkmark in GitHub Actions)
2. **Visit Expo Dashboard:**
   ```
   https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2
   ```
3. **Navigate to Builds tab**
4. **Click "Download" on your recent build**
5. **Choose APK file** (ends with `.apk`)

### Option 2: Via GitHub Actions
1. **Open your completed workflow run**
2. **Scroll to "Build Summary" section**
3. **Click "View in Expo Dashboard" link**
4. **Follow steps 2-5 from Option 1**

### Option 3: Direct Link (Production)
1. **Wait for build completion**
2. **Build summary will contain download link**
3. **Direct APK download link** (for production builds)

## 📊 Build Statistics & Monitoring

### GitHub Actions Dashboard
```
https://github.com/USERNAME/REPO-NAME/actions
```

**Available Metrics:**
- 📈 Build success/failure rates
- ⏱️ Build duration trends
- 🔄 Recent activity
- ⚡ Cached vs fresh build times

### Expo Project Dashboard
```
https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2
```

**Available Info:**
- 📱 Platform-specific builds (Android/iOS/Web)
- 🔗 Download links
- 📋 Build logs
- 📊 Build analytics

## 🔄 Common Build Issues & Solutions

### ❌ "EXPO_TOKEN secret is not set"
**Solution:** 
1. Go to repository settings > Secrets and variables
2. Add `EXPO_TOKEN` secret
3. Re-run build

### ❌ "Authentication failed"
**Solution:**
1. Regenerate Expo access token
2. Update `EXPO_TOKEN` secret
3. Re-run build

### ❌ "Build failed" 
**Solution:**
1. Check EAS build logs in Expo Dashboard
2. Verify all dependencies are compatible
3. Ensure `eas.json` is valid
4. Check Supabase credentials

### ❌ "Cache miss - longer build time"
**Solution:**
- This is normal on first builds
- Subsequent builds will be faster due to caching

## 🛠️ Advanced Features

### Environment Variables
Your app uses these environment variables (pre-configured):
```json
{
  "EXPO_PUBLIC_SUPABASE_URL": "https://xsirbxbpzxgcanmronoq.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "Your Supabase anon key"
}
```

### Build Caching
- **npm dependencies:** Cached for 30 days
- **Expo build cache:** Cached per project
- **First build:** 10-15 minutes
- **Subsequent builds:** 5-8 minutes (with cache)

### Automatic Notifications
- **Success:** Green checkmark in GitHub
- **Failure:** Red X with detailed logs
- **Build Summary:** Available in Actions tab

## 🎯 Best Practices

### ✅ Recommended Workflow
1. **Development:** Use `preview` profile for testing
2. **Feature branches:** Use manual triggers
3. **Main branch:** Use automatic triggers
4. **Production:** Use `production` profile only

### ✅ Build Strategy
- **Test locally first:** `npx eas build --local` 
- **Use preview builds:** For most testing scenarios
- **Check build logs:** For any issues
- **Download and test:** Before sharing with users

### ✅ Version Management
- Each build creates a unique version
- Build logs show commit SHA
- Use build messages for documentation

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **GitHub Repository** | `https://github.com/USERNAME/REPO-NAME` |
| **Actions Dashboard** | `https://github.com/USERNAME/REPO-NAME/actions` |
| **Expo Project** | `https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2` |
| **Secrets Setup** | `GITHUB-SECRETS-SETUP.md` |

---

**🎉 Ready to build! Follow Method 1 (Quick Build) to get your first APK in 10 minutes.**