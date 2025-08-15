/**
 * Permanent Pricing Configuration
 * Single source of truth for all pricing across the application
 */

export const PERMANENT_PRICING = {
  starter: {
    id: 'starter',
    name: 'Starter',
    leads_per_month: 50,
    monthly_price: 200,
    yearly_price: 2400,
    promotional_price: 97, // First month only
    original_price: 200,
    voice_minutes_included: 0, // No voice calls included
    voice_addon_available: true,
    gradient: 'from-electric-500 to-electric-600',
    badge: 'Get Started',
    features: [
      '50 qualified leads per month',
      '99.2% duplicate prevention', 
      'AI lead scoring',
      'Email automation',
      'Basic CRM integration',
      'Standard support',
      'Voice add-on available (+$149/mo for 150 minutes)'
    ],
    stripe_price_id: 'price_starter_monthly',
    popular: false
  },
  
  growth: {
    id: 'growth',
    name: 'Growth',
    leads_per_month: 100,
    monthly_price: 400,
    yearly_price: 4800,
    promotional_price: null,
    original_price: 400,
    voice_minutes_included: 150, // 150 minutes included
    voice_addon_available: false,
    gradient: 'from-purple-500 to-purple-600',
    badge: 'Most Popular',
    features: [
      '100 qualified leads per month',
      '150 AI voice call minutes included',
      'Advanced AI insights',
      'CRM integrations',
      'Priority support',
      'Lead enrichment',
      'Additional minutes: $1.50 each'
    ],
    stripe_price_id: 'price_growth_monthly',
    popular: true
  },
  
  scale: {
    id: 'scale',
    name: 'Scale',
    leads_per_month: 500,
    monthly_price: 999,
    yearly_price: 11988,
    promotional_price: null,
    original_price: 999,
    voice_minutes_included: 600, // 600 minutes included
    voice_addon_available: false,
    gradient: 'from-neon-500 to-neon-600',
    badge: 'Best Value',
    features: [
      '500 qualified leads per month',
      '600 AI voice call minutes included',
      'API access',
      'Team collaboration',
      'Custom reporting',
      'Advanced automations',
      'Dedicated support',
      'Additional minutes: $1.50 each'
    ],
    stripe_price_id: 'price_scale_monthly',
    popular: false
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    leads_per_month: 2000,
    monthly_price: 3000,
    yearly_price: 36000,
    promotional_price: null,
    original_price: 3000,
    voice_minutes_included: 1500, // 1500 minutes included
    voice_addon_available: false,
    gradient: 'from-purple-600 to-purple-700',
    badge: 'Enterprise Grade',
    features: [
      '2000 qualified leads per month',
      '1500 AI voice call minutes included',
      'White-label capabilities',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
      'Priority phone support',
      'Additional minutes: $1.50 each'
    ],
    stripe_price_id: 'price_enterprise_monthly',
    popular: false
  }
};

/**
 * Voice Add-on Configuration
 */
export const VOICE_ADDON = {
  id: 'voice_addon',
  name: 'Voice Agent Pack',
  monthly_price: 149,
  minutes_included: 150,
  available_for_tiers: ['starter'], // Only available for starter tier
  overage_rate: 1.50, // Per minute
  features: [
    '150 AI voice call minutes',
    'Automated lead qualification calls',
    'Real-time conversation insights',
    'Call recording and transcription',
    'Voice-to-CRM integration'
  ]
};

/**
 * Voice Pricing Constants
 */
export const VOICE_PRICING = {
  vapi_cost_per_minute: 0.10, // Our cost from VAPI
  overage_rate: 1.50, // What we charge customers
  profit_margin: 0.933 // 93.3% margin on overages
};

/**
 * Get pricing with promotional pricing applied
 */
export function getPricingWithPromo(planId, promoCode = null) {
  const plan = PERMANENT_PRICING[planId];
  if (!plan) return null;
  
  let finalPrice = plan.monthly_price;
  let discount = 0;
  let isPromotional = false;
  
  // Apply private promo codes (confidential)
  if (promoCode) {
    switch (promoCode.toUpperCase()) {
      case 'RIO2024':
        discount = plan.monthly_price; // 100% off for CEO
        finalPrice = 0;
        isPromotional = true;
        break;
      case 'DROPFLY':
        discount = plan.monthly_price * 0.5; // 50% off for company use
        finalPrice = plan.monthly_price - discount;
        isPromotional = true;
        break;
    }
  }
  
  // Apply built-in promotional pricing (starter first month)
  if (!isPromotional && plan.promotional_price && planId === 'starter') {
    discount = plan.monthly_price - plan.promotional_price;
    finalPrice = plan.promotional_price;
    isPromotional = true;
  }
  
  return {
    ...plan,
    final_price: finalPrice,
    discount: discount,
    is_promotional: isPromotional,
    promo_code: promoCode,
    savings: discount > 0 ? discount : 0
  };
}

/**
 * Get all plans with optional promo code
 */
export function getAllPricing(promoCode = null) {
  return Object.keys(PERMANENT_PRICING).map(planId => 
    getPricingWithPromo(planId, promoCode)
  );
}

export default PERMANENT_PRICING;