#!/usr/bin/env node

/**
 * Local Storage System for Development/Demo
 * Replaces Supabase when API keys are invalid
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'local-data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Initialize local data files
 */
function initializeLocalData() {
  // Initialize leads file
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  }

  // Initialize users file
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'demo@leadfly.ai',
        name: 'Demo User',
        created_at: new Date().toISOString()
      },
      {
        id: 'dropfly-test-2025',
        email: 'test@dropfly.com',
        name: 'DropFly Test Account',
        created_at: new Date().toISOString()
      },
      {
        id: 'admin-leadfly-2025',
        email: 'admin@leadfly.ai',
        name: 'LeadFly Admin',
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 'test-founder-2025',
        email: 'founder@test.com',
        name: 'Test Founder',
        role: 'user',
        created_at: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }

  // Initialize subscriptions file
  if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
    const defaultSubscriptions = [
      {
        id: '1',
        user_id: '00000000-0000-0000-0000-000000000000',
        tier: 'growth',
        status: 'active',
        monthly_leads: 100,
        leads_used_this_period: 0,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'dropfly-test-2025',
        tier: 'enterprise',
        status: 'active',
        monthly_leads: 1000,
        leads_used_this_period: 0,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        user_id: 'admin-leadfly-2025',
        tier: 'enterprise',
        status: 'active',
        monthly_leads: 5000,
        leads_used_this_period: 0,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        user_id: 'test-founder-2025',
        tier: 'enterprise',
        status: 'active',
        monthly_leads: 1000,
        leads_used_this_period: 0,
        promo_code: 'FOUNDER100',
        created_at: new Date().toISOString()
      }
    ];
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(defaultSubscriptions, null, 2));
  }
}

/**
 * Local storage operations
 */
export const LocalStorage = {
  // Read operations
  getLeads: (userId = null) => {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    return userId ? leads.filter(lead => lead.user_id === userId) : leads;
  },

  getUsers: () => {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  },

  getSubscriptions: (userId = null) => {
    const subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
    return userId ? subscriptions.filter(sub => sub.user_id === userId) : subscriptions;
  },

  // Write operations
  addLeads: (newLeads) => {
    const existingLeads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const updatedLeads = [...existingLeads, ...newLeads];
    fs.writeFileSync(LEADS_FILE, JSON.stringify(updatedLeads, null, 2));
    return newLeads;
  },

  updateSubscription: (userId, updates) => {
    const subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
    const index = subscriptions.findIndex(sub => sub.user_id === userId);
    
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates };
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
      return subscriptions[index];
    }
    return null;
  },

  // Stats operations
  getStats: () => {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    
    return {
      total_leads: leads.length,
      total_users: users.length,
      high_value_leads: leads.filter(lead => lead.lead_score >= 80).length,
      recent_leads: leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return leadDate > dayAgo;
      }).length
    };
  }
};

/**
 * Mock lead generation with local storage
 */
export async function generateLeadsLocally(userId, criteria, count = 25) {
  try {
    console.log(`🎭 Generating ${count} leads locally for ${userId}...`);

    // Check user subscription
    const subscriptions = LocalStorage.getSubscriptions(userId);
    const userSub = subscriptions.find(sub => sub.status === 'active');
    
    if (!userSub) {
      throw new Error('No active subscription found');
    }

    const remaining = userSub.monthly_leads - userSub.leads_used_this_period;
    if (count > remaining) {
      throw new Error(`Lead limit exceeded. Requested: ${count}, Remaining: ${remaining}`);
    }

    // Generate mock leads
    const mockLeads = [
      {
        id: `lead_${Date.now()}_1`,
        user_id: userId,
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+1-555-0123",
        company_name: "TechCorp Solutions",
        job_title: "VP of Marketing",
        industry: "Technology",
        lead_score: 85,
        source: 'local_mock',
        created_at: new Date().toISOString()
      },
      {
        id: `lead_${Date.now()}_2`,
        user_id: userId,
        first_name: "Michael",
        last_name: "Chen",
        email: "michael.chen@innovate.io",
        phone: "+1-555-0234",
        company_name: "Innovate Digital",
        job_title: "Chief Revenue Officer",
        industry: "SaaS",
        lead_score: 92,
        source: 'local_mock',
        created_at: new Date().toISOString()
      },
      {
        id: `lead_${Date.now()}_3`,
        user_id: userId,
        first_name: "Lisa",
        last_name: "Rodriguez",
        email: "lisa@growthscale.com",
        phone: "+1-555-0345",
        company_name: "GrowthScale",
        job_title: "Director of Sales",
        industry: "Business Services",
        lead_score: 78,
        source: 'local_mock',
        created_at: new Date().toISOString()
      }
    ].slice(0, count);

    // Store leads locally
    const storedLeads = LocalStorage.addLeads(mockLeads);

    // Update subscription usage
    LocalStorage.updateSubscription(userId, {
      leads_used_this_period: userSub.leads_used_this_period + storedLeads.length
    });

    const highValueLeads = storedLeads.filter(lead => lead.lead_score >= 80);

    return {
      success: true,
      leads: storedLeads,
      count: storedLeads.length,
      high_value_count: highValueLeads.length,
      remaining_leads: remaining - storedLeads.length,
      storage: 'local'
    };

  } catch (error) {
    console.error('Local lead generation error:', error);
    return {
      success: false,
      error: error.message,
      leads: [],
      count: 0
    };
  }
}

/**
 * Test local storage system
 */
export async function testLocalSystem() {
  console.log('🏠 Testing Local Storage System');
  console.log('===============================');

  try {
    // Initialize data
    initializeLocalData();
    console.log('✅ Local data initialized');

    // Test lead generation
    const result = await generateLeadsLocally(
      '00000000-0000-0000-0000-000000000000',
      { job_titles: ['CEO', 'VP Sales'] },
      3
    );

    if (result.success) {
      console.log(`✅ Generated ${result.count} leads locally`);
      console.log(`🔥 High-value leads: ${result.high_value_count}`);
      
      // Show stats
      const stats = LocalStorage.getStats();
      console.log(`📊 Total leads in system: ${stats.total_leads}`);
      console.log(`👥 Total users: ${stats.total_users}`);
      
      return true;
    } else {
      console.log('❌ Local generation failed:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Local system test failed:', error.message);
    return false;
  }
}

// Initialize on import
initializeLocalData();

export default {
  LocalStorage,
  generateLeadsLocally,
  testLocalSystem,
  initializeLocalData
};