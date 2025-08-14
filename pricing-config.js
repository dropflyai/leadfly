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
    gradient: 'from-electric-500 to-electric-600',
    badge: 'Get Started',
    features: [
      '50 qualified leads per month',
      '99.2% duplicate prevention', 
      'AI lead scoring',
      'Email automation',
      'Basic CRM integration',
      'Standard support'
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
    gradient: 'from-purple-500 to-purple-600',
    badge: 'Most Popular',
    features: [
      '100 qualified leads per month',
      'Advanced AI insights',
      'CRM integrations',
      'Priority support',
      'Voice calling features',
      'Lead enrichment'
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
    gradient: 'from-neon-500 to-neon-600',
    badge: 'Best Value',
    features: [
      '500 qualified leads per month',
      'API access',
      'Team collaboration',
      'Custom reporting',
      'Advanced automations',
      'Dedicated support'
    ],
    stripe_price_id: 'price_scale_monthly',
    popular: false
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    leads_per_month: 1000,
    monthly_price: 1500,
    yearly_price: 18000,
    promotional_price: null,
    original_price: 1500,
    gradient: 'from-purple-600 to-purple-700',
    badge: 'Enterprise Grade',
    features: [
      '1000 qualified leads per month',
      'White-label capabilities',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
      'Priority phone support'
    ],
    stripe_price_id: 'price_enterprise_monthly',
    popular: false
  }
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
  
  // Apply promo codes
  if (promoCode) {
    switch (promoCode.toUpperCase()) {
      case 'FOUNDER100':
      case 'LEADFLY100':
      case 'DEMO100':
        discount = plan.monthly_price; // 100% off
        finalPrice = 0;
        isPromotional = true;
        break;
      case 'LAUNCH50':
        discount = plan.monthly_price * 0.5; // 50% off
        finalPrice = plan.monthly_price - discount;
        isPromotional = true;
        break;
      case 'SAVE25':
        discount = plan.monthly_price * 0.25; // 25% off
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