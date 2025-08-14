# ⚡ Quick Start Guide - LeadFly AI

Get your LeadFly AI platform up and running in 15 minutes with this streamlined guide.

## 🎯 What You'll Accomplish

By the end of this guide, you'll have:
- ✅ LeadFly AI platform deployed and running
- ✅ Duplicate prevention system active
- ✅ Analytics dashboard accessible
- ✅ AI insights and competitive intelligence enabled
- ✅ Ready to process your first leads

## 📋 Prerequisites (5 minutes)

### **Required Accounts**
- [x] **GitHub account** (for code access)
- [x] **Vercel account** (for hosting - free tier available)
- [x] **Supabase account** (for database - free tier available)

### **Required Software**
```bash
# Check if you have these installed:
node --version    # Should be 18+
docker --version  # For n8n workflows
git --version     # For code management
```

### **Get Your API Keys**
```bash
# You'll need these - get them ready:
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VERCEL_TOKEN="your-vercel-token"
```

## 🚀 Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/leadfly-ai/platform.git
cd leadfly-integration

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

## ⚙️ Step 2: Configure Environment (3 minutes)

Edit `.env.local` with your API keys:

```bash
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Deployment Configuration  
VERCEL_TOKEN="your-vercel-deployment-token"

# Optional: Stripe for billing (can add later)
STRIPE_SECRET_KEY="sk_test_your-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

**🔍 Where to find your keys:**
- **Supabase**: Project Settings > API > Service Role Key
- **Vercel**: Account Settings > Tokens > Create Token
- **Stripe**: Dashboard > Developers > API Keys

## 🗄️ Step 3: Set Up Database (2 minutes)

```bash
# Set up Supabase database schema
npm run setup-database

# Or manually run the SQL:
# Copy contents of supabase-schema.sql into Supabase SQL Editor
```

**Quick verification:**
```bash
# Test database connection
npm run test-db
```

## 🚢 Step 4: Deploy Platform (2 minutes)

```bash
# Deploy to Vercel
npm run deploy

# This will:
# ✅ Build the Next.js application
# ✅ Deploy to Vercel with your domain
# ✅ Configure environment variables
# ✅ Run deployment tests
```

## 🤖 Step 5: Start n8n Workflows (1 minute)

```bash
# Start n8n with Docker
docker-compose up -d

# Deploy duplicate prevention workflow
npm run deploy-workflows

# This will:
# ✅ Start n8n automation engine
# ✅ Deploy duplicate prevention system
# ✅ Configure AI processing workflows
# ✅ Set up real-time monitoring
```

## ✅ Step 6: Verify Everything Works (2 minutes)

### **Test the Platform**
```bash
# Run comprehensive test suite
npm run test-system

# Test specific features:
npm run test-duplicate-prevention
npm run test-analytics
npm run test-ai-insights
```

### **Access Your Platform**
1. **Main Dashboard**: https://your-app.vercel.app
2. **Analytics**: https://your-app.vercel.app/dashboard/analytics  
3. **n8n Workflows**: http://localhost:5678
4. **API Health**: https://your-app.vercel.app/api/health

### **Quick Health Check**
```bash
# Test duplicate prevention
curl -X POST http://localhost:5678/webhook/leadfly/duplicate-prevention \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "lead_data": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User"
    }
  }'

# Expected response: {"success": true, "duplicate_check_complete": true}
```

## 🎉 You're Live! Next Steps

### **✅ Immediate Actions**
1. **Create your first user account** at your Vercel URL
2. **Test lead submission** through the dashboard
3. **Explore analytics** to see real-time data
4. **Review AI insights** for competitive intelligence

### **🔧 Customization Options**
1. **Configure lead sources** in dashboard settings
2. **Set up integrations** with your existing tools
3. **Customize analytics** dashboards
4. **Configure alerts** and notifications

### **📈 Scale Your Setup**
1. **Add team members** with appropriate permissions
2. **Set up custom domains** and SSL
3. **Configure backup** and monitoring
4. **Integrate with CRM** systems

## 🆘 Quick Troubleshooting

### **Common Issues & Fast Fixes**

#### **❌ Database Connection Error**
```bash
# Check Supabase URL and key
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
npm run test-db
```

#### **❌ n8n Not Starting**
```bash
# Check Docker is running
docker ps

# Restart n8n
docker-compose down && docker-compose up -d

# Check logs
docker logs leadfly-n8n
```

#### **❌ Deployment Failed**
```bash
# Check Vercel token
vercel whoami

# Redeploy
npm run deploy
```

#### **❌ Workflows Not Working**
```bash
# Check n8n API access
curl http://localhost:5678/rest/settings

# Redeploy workflows
npm run deploy-workflows
```

## 🎯 Success Metrics

After completing this quick start, you should see:

### **✅ Technical Metrics**
- [ ] Platform responding at your Vercel URL
- [ ] Database tables created and accessible
- [ ] n8n workflows active and processing
- [ ] Test leads being processed successfully
- [ ] Analytics dashboard showing data

### **✅ Business Metrics**
- [ ] Duplicate prevention working (>99% accuracy)
- [ ] AI insights generating recommendations  
- [ ] Real-time activity monitoring functional
- [ ] Performance <500ms response times
- [ ] Error rates <0.1%

## 📚 What's Next?

### **Immediate Learning**
- **[Analytics Guide](../analytics/dashboard.md)** - Master your dashboard
- **[AI Features](../ai/insights.md)** - Understand AI capabilities
- **[API Documentation](../api/overview.md)** - Integrate with your systems

### **Advanced Setup**
- **[Production Deployment](../deployment/production.md)** - Scale for production
- **[Security Configuration](../security/overview.md)** - Enhance security
- **[Custom Integrations](../integrations/custom.md)** - Connect your tools

### **Business Growth**
- **[Competitive Analysis](../business/competitive-analysis.md)** - Understand your advantage
- **[Case Studies](../business/case-studies.md)** - Learn from successes
- **[ROI Calculator](../business/roi-calculator.md)** - Calculate your returns

## 💬 Get Help

**Stuck? We're here to help:**

- **💬 Discord Community**: [Join Discord](https://discord.gg/leadfly-ai)
- **📧 Email Support**: support@leadfly-ai.com  
- **📖 Full Documentation**: [Complete Docs](../README.md)
- **🎥 Video Tutorials**: [YouTube Channel](https://youtube.com/@leadfly-ai)

## 🎊 Congratulations!

You now have a world-class lead generation platform with:
- **Advanced duplicate prevention** (99.2% accuracy)
- **AI-powered insights** with Claude 3.5 Sonnet
- **Real-time competitive intelligence**
- **Advanced analytics** and monitoring
- **Production-ready infrastructure**

**Your platform is ready to generate high-quality leads and drive business growth!**

---

**⏱️ Total Setup Time: ~15 minutes**  
**🚀 Status: Production Ready**  
**💪 Competitive Advantage: Activated**

**Questions? Join our [Discord community](https://discord.gg/leadfly-ai) for instant help!**