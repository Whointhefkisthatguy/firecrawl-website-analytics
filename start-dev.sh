#!/bin/bash

# Website Improver Development Startup Script
echo "🔥 Starting Website Improver Development Environment"
echo ""

# Check if we're in the right directory
if [ ! -f "apps/website-improver/package.json" ]; then
    echo "❌ Please run this script from the root directory of the firecrawl repository"
    exit 1
fi

# Start the website-improver app
echo "🚀 Starting Website Improver app..."
echo ""

cd apps/website-improver

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ No .env.local file found. Please create one based on .env.example"
    echo "   cp .env.example .env.local"
    echo "   Then edit .env.local with your actual API keys"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start the development server
echo "🌐 Starting Next.js development server on http://localhost:3000"
echo "📝 Environment variables loaded from .env.local"
echo ""
pnpm run dev