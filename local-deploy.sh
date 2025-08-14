#!/bin/bash

# DropFly LeadFly - Local Secure Deployment
# Your service key NEVER leaves your machine

echo "🚀 DropFly LeadFly - 100% Local Secure Deployment"
echo "================================================="
echo "🔐 Your service key stays on YOUR machine only!"
echo ""

# Securely prompt for key (hidden input)
echo "Enter your service_role key (hidden input):"
read -s SERVICE_KEY

# Validate key format
if [[ ! "$SERVICE_KEY" =~ ^eyJ ]]; then
    echo "❌ Invalid key format. Should start with 'eyJ'"
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."

# Use the SQL file directly
sql_file="supabase-schema.sql"

if [[ ! -f "$sql_file" ]]; then
    echo "❌ SQL file not found: $sql_file"
    exit 1
fi

# Execute using curl with the SQL file
curl -X POST \
  'https://irvyhhkoiyzartmmvbxw.supabase.co/rest/v1/rpc/exec_sql' \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(cat $sql_file | sed 's/"/\\"/g' | tr '\n' ' ')\"}"

echo ""
echo "✅ Deployment complete!"
echo "🔗 Check: https://app.supabase.com/project/irvyhhkoiyzartmmvbxw/editor"

# Clear the key from memory
unset SERVICE_KEY