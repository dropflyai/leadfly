#!/bin/bash

echo "🚀 LeadFly AI Deployment Script"
echo "================================"

# Build the application
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Ready for deployment with:"
    echo "✅ Clerk authentication"
    echo "✅ Enterprise pricing: $3000"
    echo "✅ Private promo codes only"
    echo "✅ Deployment verification markers"
    echo ""
    echo "🔗 Repository: https://github.com/dropflyai/leadfly"
    echo "🌐 Live site: https://leadflyai.com"
    echo ""
    echo "📋 Deployment checklist:"
    echo "1. Create GitHub repository: dropflyai/leadfly"
    echo "2. Push code: git push origin main --force"
    echo "3. Connect Vercel to repository"
    echo "4. Set environment variables in Vercel"
    echo "5. Deploy and verify"
else
    echo "❌ Build failed!"
    exit 1
fi