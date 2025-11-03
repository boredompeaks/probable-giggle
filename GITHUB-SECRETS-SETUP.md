# 🔐 GitHub Repository Secrets Setup Guide

This guide will walk you through setting up all required secrets for your V5 Chat Vault APK builds.

## Required Secrets

Your GitHub repository needs these secrets to enable EAS builds:

### 1. **EXPO_TOKEN** (Required)
**Purpose:** Authenticates GitHub Actions with Expo/EAS services

**Steps to obtain:**
1. Go to [expo.dev/accounts](https://expo.dev/accounts)
2. Login with your account (Uzairmalkaniuzuz@gmail.com)
3. Go to Settings > Access Tokens
4. Click "Create new token"
5. Give it a name like "GitHub Actions Build"
6. Copy the token immediately (you won't see it again)

**GitHub Setup:**
1. Go to your repository: `https://github.com/USERNAME/REPO-NAME/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: Paste your Expo token
5. Click "Add secret"

### 2. **Optional Secrets** (Pre-configured in eas.json)
These are already set in your `eas.json` but you can override them here:

| Secret Name | Value (Pre-configured) | When to Override |
|-------------|------------------------|------------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xsirbxbpzxgcanmronoq.supabase.co` | If using different Supabase project |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | If rotating Supabase keys |

## 📋 Step-by-Step Setup

### **Option A: Using GitHub Web Interface (Recommended)**

1. **Navigate to Secrets:**
   ```
   https://github.com/USERNAME/REPO-NAME/settings/secrets/actions
   ```

2. **Add EXPO_TOKEN:**
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Secret: [Your Expo access token]

3. **Add Optional Secrets (only if needed):**
   - Click "New repository secret"
   - Name: `EXPO_PUBLIC_SUPABASE_URL`
   - Secret: `https://xsirbxbpzxgcanmronoq.supabase.co`

### **Option B: Using GitHub CLI**

```bash
# Replace YOUR_TOKEN with your actual Expo token
gh secret set EXPO_TOKEN --body "YOUR_TOKEN"

# Optional: Set Supabase secrets
gh secret set EXPO_PUBLIC_SUPABASE_URL --body "https://xsirbxbpzxgcanmronoq.supabase.co"
```

## ✅ Verification

After setting up secrets, you can verify they're working by:

1. Go to Actions tab in your repository
2. Click "Quick Android Build" workflow
3. Click "Run workflow"
4. Select "preview" and click "Run workflow"
5. Wait for the build to start

## 🔒 Security Best Practices

- ✅ **DO:** Use access tokens with minimal permissions
- ✅ **DO:** Store tokens as GitHub secrets (never in code)
- ✅ **DO:** Rotate tokens regularly
- ❌ **DON'T:** Commit tokens to your repository
- ❌ **DON'T:** Share tokens with others
- ❌ **DON'T:** Use expired tokens

## 🚨 Troubleshooting

**"EXPO_TOKEN secret is not set"**
- Verify the secret is named exactly `EXPO_TOKEN`
- Check that you have admin permissions on the repository

**"Authentication failed"**
- Regenerate your Expo access token
- Update the secret with the new token

**"Build failed - Invalid token"**
- Check that your Expo account has access to project ID `a302e6c7-9320-4966-ab5b-110c210c81d2`

## 📞 Support

If you encounter issues:
1. Check the Actions tab for detailed logs
2. Verify your Expo project exists at: https://expo.dev/projects/a302e6c7-9320-4966-ab5b-110c210c81d2
3. Ensure your local `eas.json` matches the one in your repository

---

**🎯 Once secrets are set up, you're ready to trigger builds!**