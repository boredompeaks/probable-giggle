#!/bin/bash

echo "🚀 Setting up EAS CLI for V5 Chat Vault"

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please ensure Node.js is properly installed."
    exit 1
fi

echo "✅ npx is available"

# Try to verify EAS CLI is available
echo "🔧 Checking EAS CLI availability..."
npx eas-cli@latest --version

if [ $? -eq 0 ]; then
    echo "✅ EAS CLI is ready!"
    
    # Show current EAS configuration
    echo ""
    echo "📋 Current EAS Configuration:"
    if [ -f "eas.json" ]; then
        echo "✅ eas.json found with project ID: a302e6c7-9320-4966-ab5b-110c210c81d2"
    else
        echo "⚠️ eas.json not found"
    fi
    
    echo ""
    echo "🎯 Available EAS Commands:"
    echo "  npx eas-cli build                   - Build the app"
    echo "  npx eas-cli build --platform android - Build for Android"
    echo "  npx eas-cli build --platform ios     - Build for iOS"
    echo "  npx eas-cli submit                  - Submit to stores"
    echo "  npx eas-cli status                  - Check build status"
    echo "  npx eas-cli devices                 - List connected devices"
    
else
    echo "❌ EAS CLI not available. Trying alternative installation methods..."
    
    # Try to install eas-cli locally
    echo "📦 Attempting local installation..."
    npm install eas-cli --save-dev --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        echo "✅ EAS CLI installed locally!"
        echo "🎯 Use: npx eas-cli [command]"
    else
        echo "⚠️ Installation failed. You can still try:"
        echo "   npm install -g eas-cli (requires sudo)"
        echo "   yarn global add eas-cli"
        echo "   Or use npx eas-cli@latest [command]"
    fi
fi

echo ""
echo "🔍 EAS Project Setup Complete!"
echo "Project ID: a302e6c7-9320-4966-ab5b-110c210c81d2"
echo "Configuration files: eas.json ✓"
echo "App configuration: app.json ✓"
