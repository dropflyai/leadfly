# Vercel Environment Variables Checklist

## Required for Deployment Success

### Clerk Authentication (CRITICAL - Required for build)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cmFyZS1oZXJvbi01NS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_wL5Nj4pzLKnKQXw7JHRCCQG1ZaFApnTAHPlIy1qyGt
```

### Application URL
```
NEXT_PUBLIC_APP_URL=https://leadflyai.com
```

### Supabase (Optional - has fallbacks)
```
NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Stripe (Optional - for checkout)
```
STRIPE_PUBLISHABLE_KEY=your_stripe_public_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

## Deployment Status Check
- ✅ Repository connected: github.com/dropflyai/leadfly
- ✅ Latest commit pushed: [timestamp]
- ❓ Auto-deployment enabled: needs verification
- ❓ Environment variables set: needs verification

## Troubleshooting Steps
1. Verify all Clerk env vars are set in Vercel dashboard
2. Check if auto-deployment is enabled for main branch
3. Manually trigger deployment if needed
4. Check build logs for errors

## Expected Live Site Features After Deployment
1. Clerk Sign In/Sign Up buttons visible
2. Enterprise pricing: $3000/month (not $1500)
3. No public promo codes displayed
4. Proper authentication flow working