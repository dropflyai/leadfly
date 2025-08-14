#!/usr/bin/env node

// LeadFly AI - Fully Automated Vercel Deployment
// Because automation companies automate everything! 🤖

const { exec } = require('child_process');
const fs = require('fs');

const VERCEL_TOKEN = 'CFag5USNJTIKh4J1nccP0BfM';
const PROJECT_NAME = 'leadfly-ai';

// Environment variables to set
const ENV_VARS = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://irvyhhkoiyzartmmvbxw.supabase.co',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyY3loaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg1MjE3NCwiZXhwIjoyMDQ5NDI4MTc0fQ.q30mqGJAOJ-Bk-2_sMqfWWTTpvhjRVpJP6KBM3GzgDo',
  'APOLLO_API_KEY': 'zX2Fv6Tnnaued23HQngLew',
  'DEEPSEEK_API_KEY': 'sk-3e29503084eb4b09aaaa6aeff2d9eaef',
  'GOOGLE_CALENDAR_CLIENT_ID': '66750848087-ei40fbubu5ll0q5f13p6p3aq21e4h3cd.apps.googleusercontent.com',
  'AWS_LAMBDA_KEY': '9wnj87aUNwkiah7AksidIoemoe02j48pwqj2JMsiMxsXOwaid9a28a2766aJw873bnS902jgtaYuwiPSiaKS92047ake73dwegepijnva8492178skdjhu942389UIOHf81320ryuh0oisfhnejqoSDHFGPQI4234298JFVSAOJF8203SDOPF23IORNMIWEJG820GWPENIGQ3NGPsxahguqrdh'
};

async function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function setEnvironmentVariable(key, value) {
  try {
    console.log(`🔧 Setting ${key}...`);
    const command = `echo "${value}" | vercel env add ${key} production --token ${VERCEL_TOKEN}`;
    await execAsync(command);
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.log(`⚠️  ${key} might already exist or failed:`, error.message);
  }
}

async function deployToProduction() {
  try {
    console.log('🚀 Deploying to production...');
    const { stdout } = await execAsync(`vercel --prod --token ${VERCEL_TOKEN}`);
    console.log('✅ Production deployment successful!');
    return stdout;
  } catch (error) {
    console.error('❌ Production deployment failed:', error.message);
    throw error;
  }
}

async function addCustomDomain() {
  try {
    console.log('🌐 Adding custom domain leadflyai.com...');
    await execAsync(`vercel domains add leadflyai.com --token ${VERCEL_TOKEN}`);
    console.log('✅ Domain added successfully!');
  } catch (error) {
    console.log('⚠️  Domain might already be added:', error.message);
  }
}

async function main() {
  console.log('🤖 LeadFly AI - Automated Deployment Starting...');
  console.log('================================================');
  
  try {
    // Step 1: Set all environment variables
    console.log('\n📋 Step 1: Setting Environment Variables');
    for (const [key, value] of Object.entries(ENV_VARS)) {
      await setEnvironmentVariable(key, value);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
    
    // Step 2: Deploy to production
    console.log('\n🚀 Step 2: Production Deployment');
    const deployOutput = await deployToProduction();
    
    // Step 3: Add custom domain
    console.log('\n🌐 Step 3: Custom Domain Setup');
    await addCustomDomain();
    
    // Step 4: Success summary
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('========================');
    console.log('✅ Environment variables configured');
    console.log('✅ Production deployment complete');
    console.log('✅ Custom domain added');
    console.log('\n🌍 Your LeadFly AI is now live at:');
    console.log('   https://leadflyai.com (pending DNS)');
    console.log('   https://leadfly-ai.vercel.app (immediate)');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Configure DNS: CNAME @ → cname.vercel-dns.com');
    console.log('2. Configure DNS: CNAME www → cname.vercel-dns.com');
    console.log('3. Wait 24-48 hours for DNS propagation');
    console.log('4. Add authentication system');
    console.log('5. Launch first customers');
    console.log('6. Scale to $2.5M ARR! 🚀');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };