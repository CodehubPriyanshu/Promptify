import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const seedPlans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    // Create default plans
    const plans = [
      {
        name: 'Free',
        description: 'Perfect for getting started with AI prompts',
        price: {
          monthly: 0,
          yearly: 0
        },
        features: [
          { name: 'Basic Playground Access', description: '10 sessions per month', included: true },
          { name: 'Browse Free Prompts', description: 'Access to community prompts', included: true },
          { name: 'Create Public Prompts', description: 'Share with the community', included: true },
          { name: 'Basic Analytics', description: 'View basic stats', included: true },
          { name: 'Premium Prompts', description: 'Access paid content', included: false },
          { name: 'Priority Support', description: '24/7 support', included: false }
        ],
        limits: {
          playgroundSessions: 10,
          promptsPerMonth: 5,
          teamMembers: 1,
          apiCalls: 0,
          storageGB: 0.5
        },
        permissions: {
          accessPremiumPrompts: false,
          createPaidPrompts: false,
          advancedAnalytics: false,
          prioritySupport: false,
          apiAccess: false,
          whiteLabel: false,
          customIntegrations: false
        },
        metadata: {
          color: '#10B981',
          icon: 'zap',
          popular: false,
          recommended: false,
          order: 1
        },
        isActive: true,
        isVisible: true
      },
      {
        name: 'Pro',
        description: 'For professionals and content creators',
        price: {
          monthly: 29,
          yearly: 290
        },
        features: [
          { name: 'Unlimited Playground', description: 'Unlimited AI sessions', included: true },
          { name: 'Premium Prompts Access', description: 'Access all paid content', included: true },
          { name: 'Create Paid Prompts', description: 'Monetize your prompts', included: true },
          { name: 'Advanced Analytics', description: 'Detailed insights', included: true },
          { name: 'Priority Support', description: '24/7 priority support', included: true },
          { name: 'API Access', description: 'Integrate with your apps', included: true },
          { name: 'Team Collaboration', description: 'Up to 5 team members', included: true }
        ],
        limits: {
          playgroundSessions: -1,
          promptsPerMonth: -1,
          teamMembers: 5,
          apiCalls: 10000,
          storageGB: 10
        },
        permissions: {
          accessPremiumPrompts: true,
          createPaidPrompts: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
          whiteLabel: false,
          customIntegrations: false
        },
        metadata: {
          color: '#3B82F6',
          icon: 'star',
          popular: true,
          recommended: true,
          order: 2
        },
        billing: {
          trialDays: 7
        },
        isActive: true,
        isVisible: true
      },
      {
        name: 'Enterprise',
        description: 'For large teams and organizations',
        price: {
          monthly: 99,
          yearly: 990
        },
        features: [
          { name: 'Everything in Pro', description: 'All Pro features included', included: true },
          { name: 'Unlimited Team Members', description: 'No limits on team size', included: true },
          { name: 'White Label Solution', description: 'Brand it as your own', included: true },
          { name: 'Custom Integrations', description: 'Custom API endpoints', included: true },
          { name: 'Dedicated Support', description: 'Dedicated account manager', included: true },
          { name: 'SLA Guarantee', description: '99.9% uptime guarantee', included: true },
          { name: 'Advanced Security', description: 'Enterprise-grade security', included: true }
        ],
        limits: {
          playgroundSessions: -1,
          promptsPerMonth: -1,
          teamMembers: -1,
          apiCalls: -1,
          storageGB: 100
        },
        permissions: {
          accessPremiumPrompts: true,
          createPaidPrompts: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
          whiteLabel: true,
          customIntegrations: true
        },
        metadata: {
          color: '#8B5CF6',
          icon: 'building',
          popular: false,
          recommended: false,
          order: 3
        },
        billing: {
          trialDays: 14
        },
        isActive: true,
        isVisible: true
      }
    ];

    // Insert plans
    const createdPlans = await Plan.insertMany(plans);
    console.log(`Created ${createdPlans.length} plans:`);
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price.monthly}/month`);
    });

    console.log('Plans seeded successfully!');
  } catch (error) {
    console.error('Error seeding plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedPlans();
