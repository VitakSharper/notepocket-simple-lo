#!/bin/bash

# NotePocket Local Development Setup
echo "Setting up NotePocket for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Setup complete! You can now run:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build for production"
echo "  npm run preview - Preview production build"

# Start development server if requested
if [ "$1" = "--dev" ]; then
    echo "Starting development server..."
    npm run dev
fi