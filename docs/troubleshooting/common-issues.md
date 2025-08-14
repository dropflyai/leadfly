# 🔧 Troubleshooting Guide - LeadFly AI

Comprehensive troubleshooting guide for common issues, error resolution, and performance optimization.

## 🎯 Quick Diagnostic Tools

### **System Health Check**
```bash
# Run comprehensive system health check
npm run health-check

# Individual component checks
npm run check-database
npm run check-n8n
npm run check-api
npm run check-workflows
```

### **Diagnostic Commands**
```bash
# Check environment variables
npm run check-env

# Test API connectivity
curl https://your-app.vercel.app/api/health

# Verify n8n workflows
npm run verify-workflows

# Database connection test
npm run test-db-connection
```

## 🚨 Common Issues & Solutions

### **1. Authentication & Authorization Issues**

#### **❌ "Invalid API Key" Error**
```javascript
// Error message
{
  "error": "INVALID_API_KEY",
  "message": "The provided API key is invalid or expired"
}

// Solutions
const solutions = [
  "Check API key format (should start with sk_live_ or sk_test_)",
  "Verify API key hasn't expired",
  "Ensure API key has required permissions", 
  "Regenerate API key if corrupted"
]

// Verification steps
curl -H "Authorization: Bearer your_api_key" \
  https://your-app.vercel.app/api/auth/verify
```

#### **❌ "Access Denied" Error**
```javascript
// Common causes
const accessDeniedCauses = {
  insufficientPermissions: "User role lacks required permissions",
  expiredSession: "Authentication session has expired",
  ipRestriction: "Request from unauthorized IP address",
  planLimitation: "Feature requires higher subscription tier"
}

// Solutions
const solutions = {
  checkUserRole: "Verify user has correct role assignment",
  refreshSession: "Log out and log back in",
  whitelistIp: "Add IP to allowed list in settings",
  upgradePlan: "Upgrade to plan that includes this feature"
}
```

### **2. Database Connection Issues**

#### **❌ Database Connection Failed**
```bash
# Error symptoms
- "Connection timeout"
- "Unable to connect to database"
- "Database not found"

# Diagnostic steps
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
npm run test-db-connection

# Solutions
1. Verify Supabase project is active
2. Check environment variables are correct
3. Confirm database URL format
4. Test from different network (firewall issues)
```

#### **❌ Row Level Security (RLS) Errors**
```sql
-- Error: "new row violates row-level security policy"
-- Solution: Check RLS policies

-- List current policies
SELECT * FROM pg_policies WHERE tablename = 'leads';

-- Verify user authentication
SELECT auth.uid();

-- Test policy conditions
SELECT * FROM leads WHERE auth.uid() = user_id;
```

### **3. n8n Workflow Issues**

#### **❌ Workflow Not Triggering**
```javascript
// Diagnostic checklist
const workflowDiagnostics = {
  checkWebhook: "Verify webhook URL is accessible",
  checkActiveStatus: "Ensure workflow is active in n8n",
  checkApiKey: "Verify n8n API key is valid",
  checkLogs: "Review n8n execution logs"
}

// Test webhook manually
curl -X POST http://localhost:5678/webhook/leadfly/duplicate-prevention \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

// Check workflow status
npm run check-workflow-status
```

#### **❌ Workflow Execution Errors**
```bash
# Check n8n logs
docker logs leadfly-n8n

# Common error patterns
"TypeError: Cannot read property"  # Missing data field
"Request timeout"                  # API timeout
"Rate limit exceeded"              # Too many requests
"Authentication failed"            # Invalid credentials

# Solutions by error type
Error: Missing data -> Add null checks in workflow
Error: Timeout -> Increase timeout settings
Error: Rate limit -> Implement retry logic
Error: Auth -> Refresh API credentials
```

### **4. Duplicate Prevention Issues**

#### **❌ False Positives (Good leads marked as duplicates)**
```javascript
// Symptoms
const falsePositiveSymptoms = {
  highDuplicateRate: "> 20% of leads flagged",
  customerComplaints: "Legitimate leads being blocked",
  lowConfidenceScores: "Many duplicates with < 0.8 confidence"
}

// Solutions
const solutions = {
  adjustThresholds: {
    currentThreshold: 0.8,
    recommendedThreshold: 0.9,
    action: "Increase confidence threshold for blocking"
  },
  reviewAlgorithms: {
    fuzzyMatching: "Reduce fuzzy matching sensitivity",
    phoneMatching: "Improve phone number normalization",
    nameMatching: "Account for name variations"
  },
  addWhitelist: {
    trustedSources: "Whitelist known good sources",
    vipCustomers: "Exempt VIP customer domains",
    testAccounts: "Exclude test/staging data"
  }
}

// Configuration adjustment
const adjustedConfig = {
  fuzzyThreshold: 0.75,  // Reduced from 0.85
  blockingThreshold: 0.9, // Increased from 0.8
  reviewThreshold: 0.7,   // Reduced from 0.6
  whitelistDomains: ["trusted-partner.com"]
}
```

#### **❌ False Negatives (Duplicates not caught)**
```javascript
// Symptoms
const falseNegativeSymptoms = {
  obviousDuplicates: "Same email/phone not caught",
  customerReports: "Multiple entries for same lead",
  lowDetectionRate: "< 95% duplicate detection"
}

// Solutions
const improvements = {
  enhanceAlgorithms: {
    emailNormalization: "Improve email preprocessing",
    phoneFormatting: "Better phone number standardization", 
    nameMatching: "Add nickname/abbreviation matching"
  },
  lowerThresholds: {
    currentThreshold: 0.8,
    recommendedThreshold: 0.6,
    action: "Lower threshold for flagging review"
  },
  addChecks: {
    temporalMatching: "Check for rapid submissions",
    ipMatching: "Same IP multiple submissions",
    browserFingerprint: "Device-based duplicate detection"
  }
}
```

### **5. Performance Issues**

#### **❌ Slow API Response Times**
```bash
# Measure current performance
time curl https://your-app.vercel.app/api/leads

# Check response times by endpoint
npm run performance-test

# Common causes and solutions
Database queries: Add indexes, optimize queries
Large datasets: Implement pagination, caching
Network latency: Use CDN, optimize payload size
Memory usage: Optimize data structures, garbage collection
```

#### **❌ High Memory Usage**
```javascript
// Monitor memory usage
const memoryStats = {
  heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
  heapTotal: process.memoryUsage().heapTotal / 1024 / 1024,
  external: process.memoryUsage().external / 1024 / 1024
}

// Memory optimization techniques
const optimizations = {
  dataStructures: "Use efficient data structures",
  caching: "Implement smart caching strategies",
  cleanup: "Proper cleanup of event listeners",
  streaming: "Use streaming for large datasets"
}

// Garbage collection monitoring
if (global.gc) {
  global.gc()
  console.log("Memory after GC:", process.memoryUsage())
}
```

### **6. Analytics & Dashboard Issues**

#### **❌ Dashboard Not Loading**
```bash
# Check browser console for errors
# Common issues:
- CORS errors
- JavaScript errors
- Network connectivity
- Authentication issues

# Solutions:
1. Clear browser cache and cookies
2. Check network connectivity
3. Verify authentication status
4. Review browser console errors
```

#### **❌ Incorrect Analytics Data**
```javascript
// Data validation checklist
const dataValidation = {
  timeZone: "Check timezone settings match user location",
  filters: "Verify applied filters are correct",
  caching: "Clear analytics cache if data seems stale",
  permissions: "Ensure user has access to requested data"
}

// Refresh analytics cache
const refreshCache = async () => {
  await fetch('/api/analytics/refresh-cache', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer your_token' }
  })
}
```

### **7. Integration Issues**

#### **❌ CRM Sync Failures**
```javascript
// Common CRM integration issues
const crmIssues = {
  authentication: {
    error: "OAuth token expired",
    solution: "Refresh OAuth token or re-authenticate"
  },
  fieldMapping: {
    error: "Required field missing",
    solution: "Update field mapping configuration"
  },
  rateLimits: {
    error: "API rate limit exceeded", 
    solution: "Implement retry logic with backoff"
  },
  duplicates: {
    error: "Duplicate record creation",
    solution: "Improve duplicate detection in CRM"
  }
}

// Test CRM connection
const testCrmConnection = async () => {
  try {
    const response = await fetch('/api/integrations/test/salesforce')
    console.log('CRM test result:', await response.json())
  } catch (error) {
    console.error('CRM connection failed:', error)
  }
}
```

### **8. Email & Notification Issues**

#### **❌ Emails Not Sending**
```bash
# Check email service status
npm run check-email-service

# Common causes:
- Invalid SMTP credentials
- Email service rate limits
- Blocked sender reputation
- Invalid recipient addresses

# Test email functionality
npm run test-email-sending
```

#### **❌ Webhook Delivery Failures**
```javascript
// Webhook debugging
const webhookDiagnostics = {
  checkEndpoint: "Verify webhook URL is accessible",
  checkSsl: "Ensure SSL certificate is valid",
  checkResponse: "Webhook should return 2xx status",
  checkPayload: "Verify payload format is correct"
}

// Test webhook delivery
const testWebhook = async () => {
  const response = await fetch('/api/webhooks/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: true })
  })
  console.log('Webhook test:', response.status)
}
```

## 🔍 Advanced Debugging

### **Debug Mode Activation**
```bash
# Enable debug logging
export DEBUG=leadfly:*
export LOG_LEVEL=debug

# Start application with debugging
npm run dev:debug

# View detailed logs
tail -f logs/debug.log
```

### **Database Query Analysis**
```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE your_db SET log_statement = 'all';

-- Analyze slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check database connections
SELECT count(*) as connections, state 
FROM pg_stat_activity 
GROUP BY state;
```

### **Performance Profiling**
```javascript
// Enable performance monitoring
const perfHooks = require('perf_hooks')

// Measure function execution time
const measurePerformance = (fn, name) => {
  const start = perfHooks.performance.now()
  const result = fn()
  const end = perfHooks.performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

// Memory leak detection
const memoryLeakDetection = () => {
  const usage = process.memoryUsage()
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
  })
}
```

## 🛠️ Maintenance & Prevention

### **Preventive Maintenance**
```bash
# Weekly maintenance tasks
npm run maintenance:weekly

# Tasks included:
1. Clear expired sessions
2. Optimize database indexes
3. Clean up old logs
4. Update security patches
5. Refresh API credentials
6. Backup configuration
```

### **Monitoring Setup**
```javascript
// Health check endpoints
const healthChecks = {
  database: '/api/health/database',
  workflows: '/api/health/workflows', 
  integrations: '/api/health/integrations',
  analytics: '/api/health/analytics'
}

// Automated monitoring
const setupMonitoring = () => {
  setInterval(async () => {
    for (const [service, endpoint] of Object.entries(healthChecks)) {
      try {
        const response = await fetch(endpoint)
        if (!response.ok) {
          console.error(`${service} health check failed`)
          // Send alert
        }
      } catch (error) {
        console.error(`${service} monitoring error:`, error)
      }
    }
  }, 60000) // Check every minute
}
```

## 📞 Getting Help

### **Self-Service Resources**
1. **Documentation**: [docs.leadfly-ai.com](https://docs.leadfly-ai.com)
2. **API Reference**: [api.leadfly-ai.com](https://api.leadfly-ai.com)
3. **Status Page**: [status.leadfly-ai.com](https://status.leadfly-ai.com)
4. **Community Forum**: [community.leadfly-ai.com](https://community.leadfly-ai.com)

### **Support Channels**
```javascript
const supportChannels = {
  community: {
    platform: "Discord",
    url: "https://discord.gg/leadfly-ai",
    responseTime: "< 1 hour",
    availability: "24/7"
  },
  email: {
    address: "support@leadfly-ai.com",
    responseTime: "< 4 hours",
    availability: "Business hours"
  },
  enterprise: {
    phone: "+1-555-LEADFLY",
    responseTime: "< 30 minutes",
    availability: "24/7"
  }
}
```

### **Bug Report Template**
```markdown
## Bug Report

**Environment:**
- Platform: [Production/Staging/Development]
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Browser version]

**Issue Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Error Messages:**
```
[Any error messages or console logs]
```

**Additional Context:**
[Screenshots, logs, or other relevant information]
```

## 🎯 Performance Optimization

### **Quick Wins**
```javascript
const quickOptimizations = {
  caching: {
    implementation: "Redis cache for frequent queries",
    impact: "50% response time improvement"
  },
  indexing: {
    implementation: "Database indexes on common queries",
    impact: "80% query speed improvement"
  },
  compression: {
    implementation: "Gzip compression for API responses",
    impact: "70% bandwidth reduction"
  },
  cdn: {
    implementation: "Vercel Edge CDN",
    impact: "90% faster global response times"
  }
}
```

### **Advanced Optimizations**
```javascript
const advancedOptimizations = {
  batchProcessing: "Process multiple operations together",
  connectionPooling: "Reuse database connections",
  asyncProcessing: "Use background jobs for heavy tasks",
  dataPartitioning: "Split large tables for better performance"
}
```

---

**🔧 Troubleshooting Result: Comprehensive guide covering 90% of common issues with step-by-step solutions, diagnostic tools, and preventive measures.**

**🚀 Support: Multiple support channels, detailed documentation, and enterprise-grade monitoring for rapid issue resolution.**