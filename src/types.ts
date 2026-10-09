export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  tier: LoyaltyTier;
  milesBalance: number;
}

export interface FormErrors {
  id?: string;
  fullName?: string;
  email?: string;
  tier?: string;
  milesBalance?: string;
}
