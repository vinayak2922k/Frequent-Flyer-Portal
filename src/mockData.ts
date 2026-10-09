import type { Member, LoyaltyTier } from './types';

export const TIERS: LoyaltyTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export const MOCK_MEMBERS: Member[] = [
  { id: 'FF-001', fullName: 'Alice Nakamura',  email: 'alice.nakamura@aeromail.com', tier: 'Platinum', milesBalance: 125000 },
  { id: 'FF-002', fullName: 'Bernard Osei',    email: 'b.osei@flyhigh.net',          tier: 'Gold',     milesBalance: 78500  },
  { id: 'FF-003', fullName: 'Chloe Martinez',  email: 'chloe.m@travelhub.io',        tier: 'Silver',   milesBalance: 32100  },
  { id: 'FF-004', fullName: 'David Singh',     email: 'd.singh@wings.com',           tier: 'Bronze',   milesBalance: 5400   },
  { id: 'FF-005', fullName: 'Eva Lindqvist',   email: 'eva.lindqvist@nordic.air',    tier: 'Gold',     milesBalance: 61200  },
];

export const simulateDelay = (ms = 400): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
