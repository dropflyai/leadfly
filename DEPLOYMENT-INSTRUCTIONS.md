# 🚀 LeadFly AI - Complete Deployment Instructions

## 📋 Overview

This guide provides step-by-step instructions to deploy the complete LeadFly AI system with duplicate prevention, advanced analytics, and competitive intelligence features.

## 🔧 Prerequisites

Before starting deployment, ensure you have:

### **Required Software**
- **Docker & Docker Compose** (for n8n)
- **Node.js 18+** (for scripts and development)
- **Git** (for version control)

### **Required Accounts & Keys**
- **Supabase Project** (database)
- **Vercel Account** (frontend deployment)
- **Stripe Account** (billing)
- **n8n Instance** (workflow automation)

### **Environment Variables**
```bash
# Core API Keys
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VERCEL_TOKEN="your-vercel-token"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# n8n Configuration
N8N_BASE_URL="http://localhost:5678"
N8N_API_KEY="your-n8n-api-key"
N8N_WEBHOOK_URL="http://localhost:5678/webhook/leadfly/duplicate-prevention"

# LeadFly Configuration
LEADFLY_API_URL="https://leadfly-ai.vercel.app"
```

## 📝 Step-by-Step Deployment

### **Step 1: Set Up n8n Instance**

1. **Start n8n with Docker:**
```bash
cd /Users/rioallen/Documents/DropFly/knowledge-engine/leadfly-integration
docker-compose -f docker-compose.n8n.yml up -d
```

2. **Access n8n Web Interface:**
   - Open: http://localhost:5678
   - Create admin account on first launch
   - Note your login credentials

3. **Create API Key:**
   - Go to: Settings > API Keys
   - Click "Create API Key"
   - Set permissions: "Workflow: Read, Write, Execute"
   - Copy the API key
   - Set environment variable: `export N8N_API_KEY="your-api-key"`

### **Step 2: Deploy Duplicate Prevention Workflow**

1. **Run Deployment Script:**
```bash
cd /Users/rioallen/Documents/DropFly/knowledge-engine/leadfly-integration
node scripts/deploy-duplicate-prevention.js
```

2. **Verify Deployment:**
   - Check n8n interface for "LeadFly AI - Duplicate Prevention Agent"
   - Ensure workflow status shows "Active"
   - Note the webhook URL provided

3. **Test Webhook Endpoint:**
```bash
curl -X POST http://localhost:5678/webhook/leadfly/duplicate-prevention \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "source_id": "manual-test",
    "lead_data": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User",
      "company": "Test Company"
    }
  }'
```

### **Step 3: Deploy LeadFly API (if not already deployed)**

1. **Configure Environment Variables in Vercel:**
```bash
# Set all required environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Verify API Endpoints:**
   - Test: https://leadfly-ai.vercel.app/api/health
   - Test: https://leadfly-ai.vercel.app/api/analytics

### **Step 4: Run Comprehensive Tests**

1. **Execute Test Suite:**
```bash
node scripts/test-duplicate-prevention.js
```

2. **Review Test Results:**
   - All tests should pass (>90% success rate)
   - Performance should be <500ms average
   - Check for any failures or warnings

### **Step 5: Configure Production Monitoring**

1. **Set Up Health Checks:**
   - Monitor webhook endpoint uptime
   - Set up alerts for failures
   - Configure performance monitoring

2. **Database Monitoring:**
   - Monitor Supabase performance
   - Set up backup schedules
   - Configure access logs

## 🔍 Verification Checklist

### **✅ n8n Workflow Deployment**
- [ ] n8n instance running and accessible
- [ ] API key configured and working
- [ ] Duplicate prevention workflow deployed
- [ ] Workflow status shows "Active"
- [ ] Webhook endpoint responding correctly

### **✅ LeadFly API Integration**
- [ ] API deployed to Vercel
- [ ] Environment variables configured
- [ ] Analytics endpoint working
- [ ] Duplicate check API responding
- [ ] Database connectivity verified

### **✅ System Integration**
- [ ] Webhook calls LeadFly API successfully
- [ ] Duplicate detection algorithms working
- [ ] Risk assessment scoring functional
- [ ] Error handling working properly

### **✅ Performance & Monitoring**
- [ ] Response times <500ms
- [ ] Test suite passes >90%
- [ ] Monitoring alerts configured
- [ ] Backup systems in place

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

#### **1. n8n API Key Error**
```
Error: 'X-N8N-API-KEY' header required
```
**Solution:**
1. Create API key in n8n Settings > API Keys
2. Set environment variable: `export N8N_API_KEY="your-key"`
3. Restart deployment script

#### **2. Webhook 404 Error**
```
Error: Webhook endpoint not found
```
**Solution:**
1. Ensure workflow is activated in n8n
2. Check webhook path: `/webhook/leadfly/duplicate-prevention`
3. Manually trigger workflow once in n8n UI

#### **3. Database Connection Error**
```
Error: Failed to connect to Supabase
```
**Solution:**
1. Verify SUPABASE_SERVICE_ROLE_KEY
2. Check Supabase project status
3. Verify network connectivity

#### **4. Performance Issues**
```
Warning: Response time >500ms
```
**Solution:**
1. Check n8n instance resources
2. Optimize workflow complexity
3. Scale n8n instance if needed

### **Debug Commands**

```bash
# Check n8n status
docker ps | grep n8n

# View n8n logs
docker logs leadfly-n8n

# Test webhook directly
curl -v http://localhost:5678/webhook/leadfly/duplicate-prevention

# Check Vercel deployment status
vercel ls

# Monitor API performance
curl -w "@curl-format.txt" https://leadfly-ai.vercel.app/api/health
```

## 📊 Production Configuration

### **Recommended Settings**

#### **n8n Production Config**
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=secure-password
      - N8N_HOST=your-domain.com
      - N8N_PROTOCOL=https
      - N8N_PORT=5678
      - WEBHOOK_URL=https://your-domain.com
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"
```

#### **Performance Optimization**
```javascript
// Recommended thresholds
const productionConfig = {
  duplicateDetectionThreshold: 0.85,
  riskAssessmentThreshold: 0.6,
  maxProcessingTime: 2000, // 2 seconds
  maxConcurrentRequests: 50,
  webhookTimeout: 15000 // 15 seconds
}
```

## 🚀 Going Live

### **Pre-Launch Checklist**
- [ ] All tests passing
- [ ] Performance verified
- [ ] Monitoring configured
- [ ] Backup systems ready
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Error alerting active

### **Launch Steps**
1. **Switch to production environment variables**
2. **Update webhook URLs in lead capture forms**
3. **Monitor initial traffic and performance**
4. **Verify duplicate detection is working**
5. **Check analytics dashboard functionality**

### **Post-Launch Monitoring**
- Monitor webhook success rates
- Track duplicate detection accuracy
- Watch API performance metrics
- Review error logs regularly
- Validate business impact metrics

## 📞 Support & Maintenance

### **Regular Maintenance Tasks**
- **Weekly:** Review performance metrics and error logs
- **Monthly:** Update n8n and dependencies
- **Quarterly:** Security audit and backup testing

### **Scaling Considerations**
- **High Volume:** Consider n8n cluster setup
- **Global Users:** Implement CDN and regional deployments
- **Enterprise:** Add redundancy and failover systems

---

**🎯 Success Metrics:**
- **Duplicate Detection:** >99% accuracy
- **Response Time:** <500ms average
- **Uptime:** >99.9% availability
- **Lead Quality:** >80% improvement in scoring

**Built with LeadFly AI 2.0 - Advanced Lead Generation Platform**  
**Last Updated:** January 14, 2025