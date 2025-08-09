#!/bin/bash

# Quick script to run the website-improver app
echo "🔥 Starting Website Improver"
echo ""

# Navigate to the correct directory
cd "$(dirname "$0")/apps/website-improver"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in apps/website-improver/"
    echo "   Make sure you're running this from the firecrawl root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start the development server
echo "🌐 Starting development server..."
pnpm run dev