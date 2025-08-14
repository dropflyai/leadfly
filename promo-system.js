/**
 * Promo Code System for LeadFly AI
 * Handles discount codes and subscription pricing
 */

export const PromoCodes = {
  // 100% off promo codes
  'FOUNDER100': {
    discount_percent: 100,
    description: 'Founder access - 100% off',
    valid_until: '2025-12-31',
    max_uses: 10,
    current_uses: 0,
    tiers: ['starter', 'growth', 'scale', 'enterprise']
  },
  'LEADFLY100': {
    discount_percent: 100,
    description: 'LeadFly team access - 100% off',
    valid_until: '2025-12-31',
    max_uses: 5,
    current_uses: 0,
    tiers: ['starter', 'growth', 'scale', 'enterprise']
  },
  'DEMO100': {
    discount_percent: 100,
    description: 'Demo account - 100% off',
    valid_until: '2025-12-31',
    max_uses: 100,
    current_uses: 0,
    tiers: ['starter', 'growth']
  },
  
  // Regular promo codes
  'LAUNCH50': {
    discount_percent: 50,
    description: 'Launch special - 50% off first month',
    valid_until: '2025-09-30',
    max_uses: 1000,
    current_uses: 0,
    tiers: ['starter', 'growth', 'scale']
  },
  'SAVE25': {
    discount_percent: 25,
    description: '25% off first month',
    valid_until: '2025-08-31',
    max_uses: 500,
    current_uses: 0,
    tiers: ['starter', 'growth']
  }
};

export const PricingTiers = {
  starter: {
    name: 'Starter',
    leads_per_month: 50,
    base_price: 200,
    features: ['Basic lead generation', 'Email sequences', 'Standard support']
  },
  growth: {
    name: 'Growth', 
    leads_per_month: 100,
    base_price: 400,
    features: ['Advanced lead generation', 'Voice calling', 'Priority support', 'Lead enrichment']
  },
  scale: {
    name: 'Scale',
    leads_per_month: 500,
    base_price: 999,
    features: ['Premium lead generation', 'Advanced enrichment', 'Custom workflows', 'Dedicated support']
  },
  enterprise: {
    name: 'Enterprise',
    leads_per_month: 1000,
    base_price: 1500,
    features: ['Unlimited features', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee']
  }
};

/**
 * Validate and apply promo code
 */
export function validatePromoCode(code, tier) {
  const promo = PromoCodes[code.toUpperCase()];
  
  if (!promo) {
    return { valid: false, error: 'Invalid promo code' };
  }
  
  // Check if expired
  const now = new Date();
  const validUntil = new Date(promo.valid_until);
  if (now > validUntil) {
    return { valid: false, error: 'Promo code has expired' };
  }
  
  // Check usage limits
  if (promo.current_uses >= promo.max_uses) {
    return { valid: false, error: 'Promo code usage limit reached' };
  }
  
  // Check if tier is eligible
  if (!promo.tiers.includes(tier)) {
    return { valid: false, error: `Promo code not valid for ${tier} tier` };
  }
  
  return { 
    valid: true, 
    promo: promo,
    discount_percent: promo.discount_percent,
    description: promo.description
  };
}

/**
 * Calculate final price with promo code
 */
export function calculatePrice(tier, promoCode = null) {
  const tierInfo = PricingTiers[tier];
  if (!tierInfo) {
    throw new Error('Invalid pricing tier');
  }
  
  let finalPrice = tierInfo.base_price;
  let discount = 0;
  let promoInfo = null;
  
  if (promoCode) {
    const validation = validatePromoCode(promoCode, tier);
    if (validation.valid) {
      discount = (tierInfo.base_price * validation.discount_percent) / 100;
      finalPrice = tierInfo.base_price - discount;
      promoInfo = validation.promo;
    }
  }
  
  return {
    tier: tier,
    tier_name: tierInfo.name,
    base_price: tierInfo.base_price,
    discount: discount,
    final_price: finalPrice,
    leads_per_month: tierInfo.leads_per_month,
    features: tierInfo.features,
    promo_applied: promoCode,
    promo_info: promoInfo
  };
}

/**
 * Mark promo code as used
 */
export function usePromoCode(code) {
  const promo = PromoCodes[code.toUpperCase()];
  if (promo) {
    promo.current_uses += 1;
  }
}

/**
 * Get all available promo codes (for admin)
 */
export function getAllPromoCodes() {
  return Object.entries(PromoCodes).map(([code, details]) => ({
    code,
    ...details,
    remaining_uses: details.max_uses - details.current_uses
  }));
}