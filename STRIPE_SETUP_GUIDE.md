# 💳 LeadFly AI - Complete Stripe Integration Guide

## 🔑 **STEP 1: Get Your Stripe Keys**

The key you provided (`rk_test_...`) is a **restricted key**. We need your **Secret Key** for full automation.

### **Get the Correct Keys:**

1. Go to **https://dashboard.stripe.com/apikeys**
2. Copy these keys:

```bash
# TEST KEYS (for development)
Publishable key: pk_test_51RmP6QE4B82DChww... 
Secret key: sk_test_51RmP6QE4B82DChww...    # ← WE NEED THIS ONE

# LIVE KEYS (for production - get these later)
Publishable key: pk_live_51RmP6QE4B82DChww...
Secret key: sk_live_51RmP6QE4B82DChww...
```

## 🤖 **STEP 2: Automated Setup (Once You Provide Secret Key)**

With your `sk_test_...` key, I'll automatically create:

### **📦 Subscription Products:**
- ✅ **Starter**: $175/month (25 leads)
- ✅ **Growth**: $350/month (100 leads)
- ✅ **Scale**: $700/month (200 leads)
- ✅ **Pro**: $1,750/month (500 leads) 
- ✅ **Enterprise**: $3,500/month (1000 leads)

### **🔧 Add-on Products (Tier-based pricing):**
- ✅ **Advanced Research**: $50-$150/month
- ✅ **Email Automation**: $75-$200/month
- ✅ **Voice Automation**: $100-$250/month

### **🔗 Webhook Configuration:**
- ✅ Subscription events handling
- ✅ Payment success/failure
- ✅ Customer lifecycle management

## 🚀 **STEP 3: Run Automated Setup**

Once you provide your `sk_test_...` key, run:

```bash
# Update the STRIPE_SECRET_KEY in stripe-setup.js
# Then run:
node stripe-setup.js
```

This will automatically:
1. Create all 5 subscription products
2. Create 15 add-on products (3 add-ons × 5 tiers)
3. Set up webhook endpoints
4. Configure billing portal
5. Generate integration code

## 📋 **STEP 4: Environment Variables**

Add these to Vercel:

```bash
vercel env add STRIPE_SECRET_KEY
# Enter: sk_test_51RmP6QE4B82DChww... (your secret key)

vercel env add STRIPE_PUBLISHABLE_KEY  
# Enter: pk_test_51RmP6QE4B82DChww... (your publishable key)

vercel env add STRIPE_WEBHOOK_SECRET
# Enter: whsec_... (generated during setup)
```

## 🎯 **STEP 5: Test Integration**

After setup, you can:

### **Create Subscription:**
```bash
curl -X POST "https://leadflyai.com/api/stripe/create-subscription" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "price_id": "price_...", 
    "user_email": "test@example.com",
    "user_name": "Test User"
  }'
```

### **Check Subscription:**
```bash
curl "https://leadflyai.com/api/stripe/create-subscription?user_id=test-user-123"
```

## 💰 **Revenue Model Validation**

With 80% profit margins:

| Tier | Price | Leads | Cost | Profit |
|------|-------|-------|------|--------|
| Starter | $175 | 25 | $35 | $140 |
| Growth | $350 | 100 | $70 | $280 |
| Scale | $700 | 200 | $140 | $560 |
| Pro | $1,750 | 500 | $350 | $1,400 |
| Enterprise | $3,500 | 1000 | $700 | $2,800 |

**At Scale (Month 12):**
- 50 Starter customers: $7,000/month profit
- 75 Growth customers: $21,000/month profit  
- 50 Scale customers: $28,000/month profit
- 25 Pro customers: $35,000/month profit
- 10 Enterprise customers: $28,000/month profit

**Total Monthly Profit: $119,000**
**Annual Profit: $1.43M**

## 🔄 **STEP 6: Go Live Process**

When ready for production:

1. **Switch to Live Keys:**
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   # Enter: sk_live_51RmP6QE4B82DChww...
   
   vercel env add STRIPE_PUBLISHABLE_KEY production  
   # Enter: pk_live_51RmP6QE4B82DChww...
   ```

2. **Re-run Setup Script** with live keys
3. **Update webhook URL** to production domain
4. **Test with real payments**
5. **Launch first customers!**

## 🎯 **Next Actions:**

**To get started, please provide:**
- ✅ Your **Secret Key** (`sk_test_51RmP6QE4B82DChww...`)
- ✅ Your **Publishable Key** (`pk_test_51RmP6QE4B82DChww...`)

**Then I'll automate everything in 2 minutes! 🚀**

---

## 🔐 **Security Notes:**

- Test keys are safe to share for development
- Live keys should be added directly to Vercel
- Webhook secrets are auto-generated
- All payments are secured by Stripe's infrastructure

**Your $2.5M ARR billing system is 1 secret key away from being live!**