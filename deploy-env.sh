#!/bin/bash

# LeadFly AI - Environment Variables Setup for Vercel
echo "🚀 Setting up environment variables for LeadFly AI deployment..."

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://irvyhhkoiyzartmmvbxw.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY production  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo

# API Keys
vercel env add APOLLO_API_KEY production
# Enter: zX2Fv6Tnnaued23HQngLew

vercel env add DEEPSEEK_API_KEY production
# Enter: sk-3e29503084eb4b09aaaa6aeff2d9eaef

vercel env add GOOGLE_CALENDAR_CLIENT_ID production
# Enter: 66750848087-ei40fbubu5ll0q5f13p6p3aq21e4h3cd.apps.googleusercontent.com

vercel env add AWS_LAMBDA_KEY production
# Enter: 9wnj87aUNwkiah7AksidIoemoe02j48pwqj2JMsiMxsXOwaid9a28a2766aJw873bnS902jgtaYuwiPSiaKS92047ake73dwegepijnva8492178skdjhu942389UIOHf81320ryuh0oisfhnejqoSDHFGPQI4234298JFVSAOJF8203SDOPF23IORNMIWEJG820GWPENIGQ3NGPsxahguqrdh

echo "✅ Environment variables configured!"
echo "🎯 Next: Deploy with 'vercel --prod'"