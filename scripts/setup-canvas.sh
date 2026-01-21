#!/bin/bash

# Canvas Dependencies Installation Script
# Run this script to install required system dependencies for Canvas

echo "╔════════════════════════════════════════════════════════╗"
echo "║     Canvas System Dependencies Installer              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        echo "📦 Detected: Ubuntu/Debian"
        echo "🔄 Installing Canvas dependencies..."
        echo ""
        
        sudo apt-get update
        sudo apt-get install -y \
            build-essential \
            libcairo2-dev \
            libpango1.0-dev \
            libjpeg-dev \
            libgif-dev \
            librsvg2-dev \
            pkg-config
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ System dependencies installed successfully!"
        else
            echo ""
            echo "❌ Failed to install dependencies"
            exit 1
        fi
        
    elif [ -f /etc/redhat-release ]; then
        echo "📦 Detected: Fedora/RHEL/CentOS"
        echo "🔄 Installing Canvas dependencies..."
        echo ""
        
        sudo yum install -y \
            gcc-c++ \
            cairo-devel \
            pango-devel \
            libjpeg-turbo-devel \
            giflib-devel
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ System dependencies installed successfully!"
        else
            echo ""
            echo "❌ Failed to install dependencies"
            exit 1
        fi
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Detected: macOS"
    echo "🔄 Installing Canvas dependencies via Homebrew..."
    echo ""
    
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install it from https://brew.sh"
        exit 1
    fi
    
    brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ System dependencies installed successfully!"
    else
        echo ""
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "Please manually install Canvas dependencies for your system."
    exit 1
fi

echo ""
echo "🔧 Rebuilding Canvas module..."
npm rebuild canvas

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Canvas rebuilt successfully!"
    echo ""
    echo "🧪 Testing Canvas installation..."
    
    node -e "const { createCanvas } = require('canvas'); console.log('✅ Canvas is working correctly!');" 2>&1
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║              ✅ Setup Complete!                        ║"
        echo "║                                                        ║"
        echo "║  Canvas is now ready to use.                          ║"
        echo "║  You can start the bot with: npm start                ║"
        echo "╚════════════════════════════════════════════════════════╝"
    else
        echo ""
        echo "⚠️  Canvas test failed. You may need to:"
        echo "   1. Reinstall Canvas: npm install canvas --force"
        echo "   2. Check the troubleshooting guide: docs/CANVAS_TROUBLESHOOTING.md"
    fi
else
    echo ""
    echo "❌ Failed to rebuild Canvas"
    echo "See docs/CANVAS_TROUBLESHOOTING.md for help"
    exit 1
fi
