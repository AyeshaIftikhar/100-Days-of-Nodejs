export interface Charity {
  id: bigint;
  wallet: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  targetAmount: bigint;
  raisedAmount: bigint;
  withdrawnAmount: bigint;
  isActive: boolean;
  isVerified: boolean;
  createdAt: bigint;
  documents: string[];
}

export interface Donation {
  id: bigint;
  charityId: bigint;
  donor: string;
  amount: bigint;
  timestamp: bigint;
  message: string;
  isAnonymous: boolean;
}

export interface CreateCharityForm {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  targetAmount: string;
  documents: string[];
}

export interface DonationForm {
  amount: string;
  message: string;
  isAnonymous: boolean;
}
