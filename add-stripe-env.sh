#!/bin/bash

# Add Stripe environment variables to Vercel
echo "🔐 Adding Stripe environment variables to Vercel..."

# Add webhook secret
echo "whsec_JykI3ANs7co9QD2BHpMS4lrVobhnh78z" | vercel env add STRIPE_WEBHOOK_SECRET production --token CFag5USNJTIKh4J1nccP0BfM

echo "✅ Stripe webhook secret added!"
echo "🔑 You still need to add manually from Stripe dashboard:"
echo "   - STRIPE_PUBLISHABLE_KEY (pk_test_...)"
echo "   - STRIPE_SECRET_KEY (sk_test_...)"