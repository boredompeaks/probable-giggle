# 📱 V5 Chat Vault - GitHub Actions APK Build System

**Professional CI/CD pipeline for building Android APK of V5 Chat Vault app**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Platform](https://img.shields.io/badge/platform-Android-blue)
![Framework](https://img.shields.io/badge/framework-Expo%20EAS-lightgrey)

## 🎯 Overview

This repository contains a complete GitHub Actions setup for automated Android APK builds of your V5 Chat Vault application. With just a few clicks, you can generate and download professional APK files.

## ⚡ Quick Start

### 1. Setup Repository Secrets
```bash
# Required: Get your Expo access token from expo.dev/accounts
# Then add it as a GitHub secret named "EXPO_TOKEN"
```

📋 **Follow detailed guide:** [`GITHUB-SECRETS-SETUP.md`](GITHUB-SECRETS-SETUP.md)

### 2. Trigger First Build
```bash
1. Go to GitHub Actions tab
2. Click "Quick Android Build" 
3. Select "preview" build type
4. Click "Run workflow"
```

📖 **Full guide:** [`APK-BUILD-ACCESS-GUIDE.md`](APK-BUILD-ACCESS-GUIDE.md)

### 3. Download APK
```bash
# After build completes (10-15 minutes):
# 1. Visit: https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2
# 2. Click "Download" on your recent build
# 3. Install on your Android device
```

## 🏗️ Build System Features

### 🔄 Automated Workflows
- **Quick Build:** One-click builds for testing
- **Full Pipeline:** Automated builds on code changes
- **Multi-profile builds:** Preview, Production, Development

### ⚡ Performance Optimizations
- **Dependency Caching:** Faster subsequent builds
- **Smart Triggers:** Build only on relevant file changes
- **Parallel Processing:** Optimized build pipeline

### 🔒 Security & Reliability
- **Secure Token Management:** Expo access tokens stored as GitHub secrets
- **Build Validation:** Pre-build checks for common issues
- **Error Handling:** Detailed logging and troubleshooting

### 📊 Build Profiles

| Profile | Build Time | Best For | Download Access |
|---------|------------|----------|-----------------|
| **preview** | 8-12 min | Testing & QA | Internal distribution |
| **production** | 10-15 min | Release builds | Production-ready |
| **development** | 10-12 min | Debug builds | Development testing |

## 📁 Project Structure

```
V5-Chat-Vault/
├── .github/workflows/
│   ├── build-android.yml      # Main build pipeline
│   └── quick-build.yml        # Quick one-click builds
├── app.json                   # Expo app configuration
├── eas.json                   # EAS build configuration
├── GITHUB-SECRETS-SETUP.md    # Secret configuration guide
├── APK-BUILD-ACCESS-GUIDE.md  # Complete build guide
└── README.md                  # This file
```

## 🚀 Build Methods

### Method 1: Quick Build (Recommended)
```bash
GitHub > Actions > Quick Android Build > Run workflow
```
**Best for:** Immediate testing, feature validation

### Method 2: Full Pipeline
```bash
GitHub > Actions > Build Android APK > Run workflow
```
**Best for:** Production builds, automated workflows

### Method 3: Branch Builds
```bash
GitHub > Actions > Build Android APK > Select branch
```
**Best for:** Feature branches, isolated testing

## 🔧 Configuration

### Environment Variables (Pre-configured)
```json
{
  "SUPABASE_URL": "https://xsirbxbpzxgcanmronoq.supabase.co",
  "SUPABASE_ANON_KEY": "Your Supabase anonymous key",
  "EAS_PROJECT_ID": "a302e6c7-9320-4966-ab5b-110c210c81d2"
}
```

### Build Triggers
- **Manual:** GitHub Actions workflow dispatch
- **Automatic:** Push to main/master/develop branches
- **Pull Requests:** Automated builds for code review

## 📱 App Information

**App Name:** V5 Chat Vault  
**Project ID:** `a302e6c7-9320-4966-ab5b-110c210c81d2`  
**Platform:** Android (APK)  
**Framework:** React Native + Expo  
**Features:** Chat app with panic button functionality

## 🔍 Build Status & Monitoring

### Real-time Monitoring
```
GitHub Actions Dashboard:
https://github.com/USERNAME/REPO-NAME/actions

Expo Project Dashboard: 
https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2
```

### Build Timeline
- **Trigger:** Instant
- **Setup:** 1-2 minutes
- **Build:** 8-15 minutes (depending on profile)
- **Download:** Immediate after completion

## 🛠️ Troubleshooting

### Common Issues

#### 🔴 "EXPO_TOKEN secret not set"
**Solution:** Add Expo access token as GitHub secret
```bash
Repository Settings > Secrets and Variables > Actions > New secret
Name: EXPO_TOKEN
Value: [Your Expo access token]
```

#### 🔴 "Build failed - Authentication"
**Solution:** Verify and refresh Expo token
```bash
1. Regenerate token at expo.dev/accounts
2. Update GitHub secret
3. Re-run build
```

#### 🔴 "Build failed - Dependencies"
**Solution:** Check build logs and dependency compatibility
```bash
1. Review Expo Dashboard build logs
2. Verify eas.json configuration
3. Check Supabase credentials
```

## 📞 Support & Resources

### Documentation
- **Secret Setup:** [`GITHUB-SECRETS-SETUP.md`](GITHUB-SECRETS-SETUP.md)
- **Build Guide:** [`APK-BUILD-ACCESS-GUIDE.md`](APK-BUILD-ACCESS-GUIDE.md)
- **EAS Documentation:** [docs.expo.dev/eas](https://docs.expo.dev/eas)

### External Links
- **Expo Dashboard:** [expo.dev/accounts](https://expo.dev/accounts)
- **EAS CLI:** [github.com/expo/eas-cli](https://github.com/expo/eas-cli)
- **Expo Documentation:** [docs.expo.dev](https://docs.expo.dev)

## 🎯 Next Steps

1. **🔐 Setup Repository Secrets** - Required for builds
2. **🚀 Run First Build** - Test the complete pipeline
3. **📱 Download & Test** - Install on Android device
4. **🔄 Set up Automations** - Enable automatic builds on push

---

## ✅ Setup Checklist

- [ ] Add `EXPO_TOKEN` secret to GitHub repository
- [ ] Verify project ID in `eas.json`: `a302e6c7-9320-4966-ab5b-110c210c81d2`
- [ ] Test quick build workflow
- [ ] Download and test APK on Android device
- [ ] Enable automatic builds (optional)
- [ ] Set up branch protection rules (optional)

**🎉 Ready to build your first APK! Start with the Quick Build method for immediate results.**