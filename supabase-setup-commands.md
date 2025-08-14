# DropFly LeadFly - Supabase Setup with MCP

## 🔐 SECURITY FIRST

**IMPORTANT**: The service role key shared needs to be regenerated immediately for security.

**Project Details:**
- Project Ref: `irvyhhkoiyzartmmvbxw`
- Region: (to be determined)
- Database URL: `https://irvyhhkoiyzartmmvbxw.supabase.co`

## 📋 SETUP STEPS

### 1. Regenerate Keys (CRITICAL)
Go to: https://app.supabase.com/project/irvyhhkoiyzartmmvbxw/settings/api
- Regenerate service_role key
- Get your personal access token from: https://app.supabase.com/account/tokens

### 2. Configure MCP Server
```bash
# Add Supabase MCP server to Claude
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --project-ref=irvyhhkoiyzartmmvbxw

# Set environment variable with your NEW personal access token
export SUPABASE_ACCESS_TOKEN="your_personal_access_token_here"
```

### 3. Alternative Setup (If MCP not available)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to existing project
supabase link --project-ref irvyhhkoiyzartmmvbxw
```

## 🏗️ WHAT WE'LL BUILD

### Database Schema
- ✅ User profiles and authentication
- ✅ Subscription tiers (Starter, Growth, Scale, Pro, Enterprise)
- ✅ Add-on packages with tiered pricing
- ✅ Feature toggles system
- ✅ Leads storage with AI scoring
- ✅ Usage tracking and billing

### Feature Toggles
- ✅ 25+ features with granular control
- ✅ Tier-based access (80% margins)
- ✅ Add-on activation system
- ✅ Real-time feature checking

### API Integration
- ✅ Lead generation pipeline
- ✅ Multi-source data enrichment
- ✅ Usage limits and tracking
- ✅ Billing integration ready

## 📊 REVENUE MODEL

**Base Subscriptions:**
- Starter: $175/month (25 leads)
- Growth: $350/month (50 leads)
- Scale: $700/month (100 leads)
- Pro: $1,750/month (250 leads)
- Enterprise: $3,500+/month (500+ leads)

**Add-on Revenue:**
- Research Intelligence: $25-$250/month
- Email Personalization: $40-$375/month
- Automation Suite: $75-$400/month
- Voice AI Calling: $50-$250/month
- Conversion Optimization: $50-$250/month

**Total Potential: $2.5M+ ARR**

## 🚀 DEPLOYMENT PLAN

1. **Secure Setup** - Regenerate keys, configure MCP
2. **Database Creation** - Build complete schema
3. **Feature System** - Deploy toggle infrastructure  
4. **API Integration** - Connect data sources
5. **Testing** - Verify all tiers and features work
6. **Go Live** - Launch the system

## 🔄 NEXT ACTIONS

Please:
1. **Regenerate your service role key** immediately
2. **Get your personal access token** 
3. **Confirm you want to proceed** with full deployment
4. **Share the new credentials** securely (if comfortable)

Then I'll build the entire system using MCP tools directly in your Supabase project.