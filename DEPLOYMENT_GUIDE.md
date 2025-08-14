# 🚀 LeadFly AI Deployment Guide

Complete step-by-step guide to deploy your $2.5M ARR lead generation platform to leadflyai.com

## Prerequisites ✅

- Domain: leadflyai.com (make sure you own this)
- Vercel account (free)
- All API keys ready

## Step 1: Login to Vercel

```bash
vercel login
```
Choose your preferred login method (GitHub recommended)

## Step 2: Initialize Project

```bash
cd /Users/rioallen/Documents/DropFly/knowledge-engine/leadfly-integration
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account
- **Link to existing project?** → No
- **Project name** → `leadfly-ai`
- **Directory** → `./` (current directory)

## Step 3: Set Environment Variables

Run these commands one by one:

```bash
# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://irvyhhkoiyzartmmvbxw.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo

# API Keys
vercel env add APOLLO_API_KEY
# Enter: zX2Fv6Tnnaued23HQngLew

vercel env add DEEPSEEK_API_KEY
# Enter: sk-3e29503084eb4b09aaaa6aeff2d9eaef

vercel env add GOOGLE_CALENDAR_CLIENT_ID
# Enter: 66750848087-ei40fbubu5ll0q5f13p6p3aq21e4h3cd.apps.googleusercontent.com

vercel env add AWS_LAMBDA_KEY
# Enter: 9wnj87aUNwkiah7AksidIoemoe02j48pwqj2JMsiMxsXOwaid9a28a2766aJw873bnS902jgtaYuwiPSiaKS92047ake73dwegepijnva8492178skdjhu942389UIOHf81320ryuh0oisfhnejqoSDHFGPQI4234298JFVSAOJF8203SDOPF23IORNMIWEJG820GWPENIGQ3NGPsxahguqrdh
```

For each command:
1. Select environment: **Production**
2. Enter the value when prompted
3. Press Enter to confirm

## Step 4: Deploy to Production

```bash
vercel --prod
```

This will:
- Build your Next.js application
- Deploy to Vercel's global CDN
- Provide you with a deployment URL

## Step 5: Add Custom Domain

```bash
vercel domains add leadflyai.com
```

## Step 6: Configure DNS

**If your domain is NOT with Vercel:**

Add these DNS records at your domain registrar:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**If your domain IS with Vercel:**
- Vercel will automatically configure DNS

## Step 7: Verify Deployment

1. Visit `https://leadflyai.com`
2. Check that the dark theme loads correctly
3. Test the dashboard at `https://leadflyai.com/dashboard`
4. Verify API endpoints work

## Troubleshooting 🔧

### Build Fails
```bash
# Check build locally first
npm run build
```

### Environment Variables Missing
```bash
# List all env vars
vercel env ls

# Pull env vars locally for testing
vercel env pull .env.local
```

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Check DNS with: `dig leadflyai.com`
- Verify CNAME points to `cname.vercel-dns.com`

### API Errors
- Check Vercel function logs in dashboard
- Verify all environment variables are set
- Test API endpoints in Vercel preview deployment first

## Post-Deployment Checklist ✅

- [ ] Homepage loads with dark theme
- [ ] Dashboard displays neural leads
- [ ] Lead generation form works
- [ ] All gradients and animations working
- [ ] Mobile responsive design
- [ ] Fast loading times (<2s)
- [ ] SSL certificate active (https://)

## Monitoring & Performance

- **Vercel Analytics**: Monitor traffic and performance
- **Error Tracking**: Check Vercel function logs
- **API Monitoring**: Watch API response times
- **User Feedback**: Monitor user interactions

## Next Steps After Deployment

1. **Add Authentication** (Supabase Auth)
2. **Set up Stripe Billing**
3. **Launch Beta Customers**
4. **Monitor Performance**
5. **Scale to $2.5M ARR**

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# Remove deployment
vercel rm leadfly-ai
```

🎉 **Your quantum lead generation empire is now live at leadflyai.com!**