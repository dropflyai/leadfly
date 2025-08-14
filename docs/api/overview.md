# 🔌 API Documentation - LeadFly AI

Complete API reference for integrating with LeadFly AI's lead generation platform.

## 📋 API Overview

### **Base URL**
```
Production: https://leadfly-ai.vercel.app/api
Staging: https://staging-leadfly-ai.vercel.app/api
```

### **Authentication**
```bash
# All API requests require authentication
Authorization: Bearer your-api-key
Content-Type: application/json
```

### **Rate Limits**
```
Free Tier: 100 requests/hour
Pro Tier: 1,000 requests/hour  
Enterprise: 10,000 requests/hour
```

## 🚀 Core API Endpoints

### **Lead Processing**

#### **POST /automation/lead-processor**
Process a new lead through the qualification pipeline.

```javascript
// Request
POST /api/automation/lead-processor
{
  "user_id": "uuid",
  "source_id": "landing-page-1",
  "lead_data": {
    "email": "john@acme.com",
    "phone": "+1-555-123-4567",
    "first_name": "John",
    "last_name": "Doe", 
    "company": "Acme Corp",
    "title": "CEO",
    "website": "acme.com",
    "industry": "Technology",
    "company_size": "50-200",
    "annual_revenue": "$5M-$10M"
  },
  "source_context": {
    "campaign": "Q1-2025-Tech-Leaders",
    "utm_source": "google",
    "utm_medium": "cpc"
  }
}

// Response  
{
  "success": true,
  "lead_id": "lead_uuid",
  "processing_status": "qualified",
  "lead_score": 87,
  "qualification_result": {
    "quality_score": 0.87,
    "fit_score": 0.92,
    "intent_score": 0.83,
    "completeness_score": 0.94
  },
  "duplicate_check": {
    "is_duplicate": false,
    "confidence": 0.02,
    "method": "multi_algorithm"
  },
  "next_actions": [
    {
      "action": "send_nurture_email",
      "scheduled_at": "2025-01-14T15:30:00Z",
      "sequence_id": "tech_leader_nurture"
    },
    {
      "action": "create_landing_page", 
      "status": "completed",
      "landing_page_url": "https://leadfly.ai/l/acme-corp"
    }
  ],
  "processing_time_ms": 156
}
```

#### **GET /leads/{lead_id}**
Retrieve lead details and processing history.

```javascript
// Response
{
  "lead_id": "lead_uuid",
  "status": "qualified",
  "created_at": "2025-01-14T10:00:00Z",
  "updated_at": "2025-01-14T15:30:00Z",
  "lead_data": { /* original lead data */ },
  "qualification_result": { /* qualification scores */ },
  "activity_history": [
    {
      "timestamp": "2025-01-14T10:00:00Z",
      "action": "lead_created",
      "details": "Lead entered system from landing-page-1"
    },
    {
      "timestamp": "2025-01-14T10:01:00Z", 
      "action": "duplicate_check_passed",
      "details": "No duplicates found (confidence: 0.02)"
    },
    {
      "timestamp": "2025-01-14T10:02:00Z",
      "action": "qualified",
      "details": "Lead score: 87/100"
    }
  ],
  "conversion_data": {
    "landing_page_visits": 3,
    "email_opens": 2,
    "email_clicks": 1,
    "form_submissions": 1,
    "call_scheduled": false
  }
}
```

### **Analytics & Reporting**

#### **GET /analytics**
Retrieve analytics data for dashboard display.

```javascript
// Query parameters
?user_id=uuid&timeRange=7d&metrics=leads,conversions,revenue

// Response
{
  "timeRange": "7d",
  "summary": {
    "total_leads": 1247,
    "qualified_leads": 892,
    "conversions": 127,
    "revenue": 63500,
    "conversion_rate": 0.142,
    "avg_lead_score": 73,
    "duplicate_prevention_saves": 312
  },
  "daily_metrics": [
    {
      "date": "2025-01-14",
      "leads": 178,
      "qualified": 127,
      "conversions": 18,
      "revenue": 9000
    }
  ],
  "source_performance": [
    {
      "source": "google-ads",
      "leads": 456,
      "conversion_rate": 0.18,
      "cost_per_lead": 12.50,
      "roi": 340
    }
  ],
  "lead_quality_distribution": {
    "high_quality": 387,
    "medium_quality": 501,
    "low_quality": 359
  }
}
```

#### **GET /analytics/competitive-intelligence**
Real-time competitive analysis data.

```javascript
// Response
{
  "market_analysis": {
    "industry_growth": 0.15,
    "competitive_pressure": "medium",
    "opportunity_score": 0.78,
    "market_saturation": 0.42
  },
  "competitor_activity": [
    {
      "competitor": "apollo",
      "activity_level": "high",
      "pricing_changes": false,
      "feature_releases": 2,
      "market_share_trend": "stable"
    }
  ],
  "recommendations": [
    {
      "type": "pricing_optimization",
      "confidence": 0.87,
      "description": "Consider raising Pro tier pricing by 15%",
      "potential_impact": "+$12K monthly revenue"
    },
    {
      "type": "feature_gap",
      "confidence": 0.91,
      "description": "Competitors lack real-time duplicate prevention",
      "action": "Emphasize this advantage in marketing"
    }
  ]
}
```

### **Duplicate Prevention**

#### **POST /duplicate-check**
Check if a lead is a duplicate before processing.

```javascript
// Request
{
  "user_id": "uuid",
  "lead_data": {
    "email": "john@acme.com",
    "phone": "+1-555-123-4567", 
    "first_name": "John",
    "company": "Acme Corp"
  }
}

// Response
{
  "is_duplicate": false,
  "confidence_score": 0.12,
  "risk_level": "low",
  "checks_performed": [
    {
      "method": "email_exact",
      "match_found": false,
      "confidence": 0.0
    },
    {
      "method": "phone_fuzzy", 
      "match_found": false,
      "confidence": 0.0
    },
    {
      "method": "name_company_fuzzy",
      "match_found": true,
      "confidence": 0.12,
      "details": "Weak similarity to existing lead"
    }
  ],
  "recommendation": "allow_processing",
  "processing_time_ms": 89
}
```

### **Automation & Workflows**

#### **GET /workflows/status**
Check status of all automation workflows.

```javascript
// Response
{
  "workflows": [
    {
      "id": "duplicate_prevention",
      "name": "Duplicate Prevention Agent",
      "status": "active",
      "executions_today": 1247,
      "success_rate": 0.992,
      "avg_execution_time": 89
    },
    {
      "id": "lead_qualification",
      "name": "Lead Qualification Engine", 
      "status": "active",
      "executions_today": 892,
      "success_rate": 0.987,
      "avg_execution_time": 156
    }
  ],
  "system_health": {
    "overall_status": "healthy",
    "api_response_time": 45,
    "database_status": "optimal",
    "n8n_status": "running"
  }
}
```

#### **POST /workflows/trigger**
Manually trigger a specific workflow.

```javascript
// Request
{
  "workflow_id": "duplicate_prevention",
  "data": {
    "user_id": "uuid",
    "lead_data": { /* lead data */ }
  }
}

// Response
{
  "execution_id": "exec_uuid",
  "status": "started",
  "estimated_completion": "2025-01-14T10:02:00Z"
}
```

## 🔒 Authentication & Security

### **API Key Management**

#### **POST /auth/api-keys**
Create a new API key.

```javascript
// Request
{
  "name": "Production Integration",
  "permissions": ["read:leads", "write:leads", "read:analytics"],
  "expires_at": "2025-12-31T23:59:59Z"
}

// Response
{
  "api_key": "sk_live_...",
  "key_id": "key_uuid",
  "permissions": ["read:leads", "write:leads", "read:analytics"],
  "created_at": "2025-01-14T10:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

### **Permission Scopes**
```
read:leads         - Read lead data
write:leads        - Create and update leads
delete:leads       - Delete leads
read:analytics     - Access analytics data
write:workflows    - Trigger workflows
admin:account      - Account management
```

## 📊 Webhook Integration

### **Webhook Configuration**

#### **POST /webhooks**
Set up webhook endpoints for real-time events.

```javascript
// Request
{
  "url": "https://your-app.com/webhooks/leadfly",
  "events": ["lead.created", "lead.qualified", "lead.converted"],
  "secret": "your_webhook_secret"
}

// Response
{
  "webhook_id": "wh_uuid",
  "url": "https://your-app.com/webhooks/leadfly",
  "events": ["lead.created", "lead.qualified", "lead.converted"],
  "created_at": "2025-01-14T10:00:00Z",
  "status": "active"
}
```

### **Webhook Events**

#### **lead.created**
```javascript
{
  "event": "lead.created",
  "timestamp": "2025-01-14T10:00:00Z",
  "data": {
    "lead_id": "lead_uuid",
    "user_id": "user_uuid",
    "source_id": "landing-page-1",
    "lead_data": { /* lead data */ }
  }
}
```

#### **lead.qualified**
```javascript
{
  "event": "lead.qualified", 
  "timestamp": "2025-01-14T10:02:00Z",
  "data": {
    "lead_id": "lead_uuid",
    "lead_score": 87,
    "qualification_result": { /* qualification data */ }
  }
}
```

## ⚠️ Error Handling

### **Error Response Format**
```javascript
{
  "success": false,
  "error": {
    "code": "DUPLICATE_LEAD_DETECTED",
    "message": "This lead already exists in your database",
    "details": {
      "existing_lead_id": "lead_uuid",
      "confidence_score": 0.94,
      "detection_method": "email_exact"
    }
  },
  "request_id": "req_uuid",
  "timestamp": "2025-01-14T10:00:00Z"
}
```

### **Common Error Codes**
```
INVALID_API_KEY           - API key is invalid or expired
RATE_LIMIT_EXCEEDED       - Too many requests
DUPLICATE_LEAD_DETECTED   - Lead already exists
INVALID_DATA_FORMAT       - Request data is malformed
WORKFLOW_EXECUTION_FAILED - Automation workflow failed
INSUFFICIENT_PERMISSIONS  - API key lacks required permissions
```

## 🚀 SDK & Libraries

### **JavaScript/Node.js**
```bash
npm install @leadfly-ai/sdk
```

```javascript
import { LeadFlyAI } from '@leadfly-ai/sdk'

const client = new LeadFlyAI({
  apiKey: 'your_api_key',
  environment: 'production'
})

// Submit a lead
const result = await client.leads.create({
  email: 'john@acme.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Acme Corp'
})

// Check for duplicates
const duplicateCheck = await client.duplicates.check({
  email: 'john@acme.com'
})

// Get analytics
const analytics = await client.analytics.get({
  timeRange: '7d',
  metrics: ['leads', 'conversions']
})
```

### **Python**
```bash
pip install leadfly-ai
```

```python
from leadfly_ai import LeadFlyAI

client = LeadFlyAI(api_key='your_api_key')

# Submit a lead
result = client.leads.create(
    email='john@acme.com',
    first_name='John',
    last_name='Doe',
    company='Acme Corp'
)

# Check analytics
analytics = client.analytics.get(
    time_range='7d',
    metrics=['leads', 'conversions']
)
```

## 🧪 Testing & Sandbox

### **Sandbox Environment**
```
Base URL: https://sandbox-leadfly-ai.vercel.app/api
API Key: sk_test_...
```

### **Test Data**
```javascript
// Use these test emails to trigger specific scenarios
{
  "duplicate@test.com": "Will trigger duplicate detection",
  "invalid@test.com": "Will fail validation",
  "qualified@test.com": "Will score 95+ and auto-qualify",
  "spam@test.com": "Will be flagged as spam risk"
}
```

## 📞 Support & Resources

- **API Status**: [status.leadfly-ai.com](https://status.leadfly-ai.com)
- **Postman Collection**: [Download Collection](https://api.leadfly-ai.com/postman)
- **OpenAPI Spec**: [Download Spec](https://api.leadfly-ai.com/openapi.json)
- **Support**: api-support@leadfly-ai.com

---

**🎯 API Performance**: Sub-50ms response times with 99.9% uptime  
**🛡️ Security**: Enterprise-grade authentication and encryption  
**📈 Scalability**: Handles 10,000+ concurrent requests  
**🔌 Integration**: Works with any system or programming language**