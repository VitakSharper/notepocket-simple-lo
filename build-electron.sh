#!/bin/bash

# NotePocket Electron Build Script
# Builds the application for desktop distribution

set -e

echo "🚀 Building NotePocket for Desktop..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

echo "📱 Packaging Electron app..."
npm run electron-pack

echo "✅ Build complete! Check the dist-electron/ directory for your app."

# Show the built files
if [ -d "dist-electron" ]; then
    echo ""
    echo "📁 Built files:"
    ls -la dist-electron/
else
    echo "⚠️  dist-electron directory not found. Check for build errors above."
fi