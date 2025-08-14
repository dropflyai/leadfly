// LeadFly AI - Automated Stripe Setup
// Create all products, prices, and billing infrastructure

import Stripe from 'stripe';

// You'll need to provide your actual secret key
const STRIPE_SECRET_KEY = 'sk_test_YOUR_SECRET_KEY_HERE'; // Replace with your sk_test_ key
const stripe = new Stripe(STRIPE_SECRET_KEY);

// LeadFly AI Product Configuration
const LEADFLY_PRODUCTS = [
  {
    name: 'LeadFly AI - Starter',
    description: 'Perfect for small teams getting started with AI lead generation',
    price: 17500, // $175.00 in cents
    leads: 25,
    interval: 'month',
    features: [
      'Apollo.io lead generation',
      'AI lead scoring',
      'Basic email templates',
      'Standard support'
    ]
  },
  {
    name: 'LeadFly AI - Growth',
    description: 'Ideal for growing sales teams scaling their outreach',
    price: 35000, // $350.00 in cents
    leads: 100,
    interval: 'month',
    features: [
      'Everything in Starter',
      'Advanced AI scoring',
      'Email automation',
      'LinkedIn integration',
      'Priority support'
    ]
  },
  {
    name: 'LeadFly AI - Scale',
    description: 'For established teams ready to scale lead generation',
    price: 70000, // $700.00 in cents
    leads: 200,
    interval: 'month',
    features: [
      'Everything in Growth',
      'Multi-source enrichment',
      'Voice automation',
      'Custom workflows',
      'Dedicated support'
    ]
  },
  {
    name: 'LeadFly AI - Pro',
    description: 'Maximum power for high-volume lead generation',
    price: 175000, // $1,750.00 in cents
    leads: 500,
    interval: 'month',
    popular: true,
    features: [
      'Everything in Scale',
      'Enterprise integrations',
      'Advanced analytics',
      'White-label options',
      'Account manager'
    ]
  },
  {
    name: 'LeadFly AI - Enterprise',
    description: 'Custom solutions for enterprise-scale operations',
    price: 350000, // $3,500.00 in cents
    leads: 1000,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Custom development',
      'Unlimited integrations',
      'SLA guarantees',
      'Premium support'
    ]
  }
];

// Add-on products with tier-based pricing
const ADDON_PRODUCTS = [
  {
    name: 'Advanced Research Add-on',
    description: 'Deep company analysis and intent signals',
    baseName: 'advanced_research',
    pricing: {
      starter: 5000,   // $50
      growth: 7500,    // $75
      scale: 10000,    // $100
      pro: 12500,      // $125
      enterprise: 15000 // $150
    }
  },
  {
    name: 'Email Automation Add-on',
    description: 'Multi-sequence email campaigns',
    baseName: 'email_automation',
    pricing: {
      starter: 7500,   // $75
      growth: 10000,   // $100
      scale: 12500,    // $125
      pro: 15000,      // $150
      enterprise: 20000 // $200
    }
  },
  {
    name: 'Voice Automation Add-on',
    description: 'AI-powered voice calls and follow-ups',
    baseName: 'voice_automation',
    pricing: {
      starter: 10000,  // $100
      growth: 12500,   // $125
      scale: 15000,    // $150
      pro: 17500,      // $175
      enterprise: 25000 // $250
    }
  }
];

async function createProduct(productConfig) {
  try {
    console.log(`🛍️ Creating product: ${productConfig.name}`);
    
    // Create the product
    const product = await stripe.products.create({
      name: productConfig.name,
      description: productConfig.description,
      metadata: {
        leads: productConfig.leads.toString(),
        features: JSON.stringify(productConfig.features),
        popular: productConfig.popular ? 'true' : 'false'
      }
    });

    // Create the price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productConfig.price,
      currency: 'usd',
      recurring: {
        interval: productConfig.interval
      },
      metadata: {
        leads: productConfig.leads.toString()
      }
    });

    console.log(`✅ Created product: ${product.name} - $${productConfig.price / 100}/month`);
    
    return {
      product,
      price,
      config: productConfig
    };

  } catch (error) {
    console.error(`❌ Failed to create product ${productConfig.name}:`, error.message);
    return null;
  }
}

async function createAddonProducts(addonConfig) {
  const results = [];
  
  for (const [tier, price] of Object.entries(addonConfig.pricing)) {
    try {
      console.log(`🔧 Creating ${addonConfig.name} for ${tier} tier`);
      
      const product = await stripe.products.create({
        name: `${addonConfig.name} - ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        description: `${addonConfig.description} (${tier} tier)`,
        metadata: {
          addon_type: addonConfig.baseName,
          tier: tier
        }
      });

      const priceObj = await stripe.prices.create({
        product: product.id,
        unit_amount: price,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          addon_type: addonConfig.baseName,
          tier: tier
        }
      });

      results.push({
        product,
        price: priceObj,
        tier,
        amount: price
      });

      console.log(`✅ Created addon: ${product.name} - $${price / 100}/month`);

    } catch (error) {
      console.error(`❌ Failed to create addon for ${tier}:`, error.message);
    }
  }
  
  return results;
}

async function setupWebhookEndpoint() {
  try {
    console.log('🔗 Setting up webhook endpoint...');
    
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://leadflyai.com/api/stripe/webhook',
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.created',
        'customer.updated'
      ]
    });

    console.log('✅ Webhook endpoint created:', webhook.url);
    console.log('🔐 Webhook secret:', webhook.secret);
    
    return webhook;

  } catch (error) {
    console.error('❌ Failed to create webhook:', error.message);
    return null;
  }
}

async function setupStripeProducts() {
  console.log('🚀 LeadFly AI - Automated Stripe Setup');
  console.log('====================================');
  
  const results = {
    products: [],
    addons: [],
    webhook: null
  };

  try {
    // Create main subscription products
    console.log('\n📦 Creating Subscription Products...');
    for (const productConfig of LEADFLY_PRODUCTS) {
      const result = await createProduct(productConfig);
      if (result) {
        results.products.push(result);
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }

    // Create addon products
    console.log('\n🔧 Creating Add-on Products...');
    for (const addonConfig of ADDON_PRODUCTS) {
      const addonResults = await createAddonProducts(addonConfig);
      results.addons.push(...addonResults);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }

    // Setup webhook
    console.log('\n🔗 Setting up Webhooks...');
    const webhook = await setupWebhookEndpoint();
    results.webhook = webhook;

    // Success summary
    console.log('\n🎉 STRIPE SETUP COMPLETE!');
    console.log('========================');
    console.log(`✅ Products created: ${results.products.length}`);
    console.log(`✅ Add-ons created: ${results.addons.length}`);
    console.log(`✅ Webhook configured: ${webhook ? 'Yes' : 'No'}`);
    
    console.log('\n💰 Subscription Products:');
    results.products.forEach(p => {
      console.log(`  - ${p.config.name}: $${p.config.price / 100}/month (${p.config.leads} leads)`);
    });

    console.log('\n🔧 Add-on Products Created:');
    console.log(`  - Advanced Research: 5 tiers ($50-$150/month)`);
    console.log(`  - Email Automation: 5 tiers ($75-$200/month)`);
    console.log(`  - Voice Automation: 5 tiers ($100-$250/month)`);

    console.log('\n🔑 Important Keys for Integration:');
    if (webhook) {
      console.log(`  - Webhook Secret: ${webhook.secret}`);
    }
    console.log(`  - Add these to your environment variables`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Add Stripe keys to Vercel environment');
    console.log('2. Create subscription management UI');
    console.log('3. Test payment flows');
    console.log('4. Launch first customers!');

    return results;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return null;
  }
}

// Export for use
export { setupStripeProducts, LEADFLY_PRODUCTS, ADDON_PRODUCTS };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStripeProducts();
}