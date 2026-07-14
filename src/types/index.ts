export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface GroupWithMembers {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  members: {
    user: UserProfile;
  }[];
}

export interface ExpenseWithDetails {
  id: string;
  amount: number;
  description: string;
  date: Date;
  paidBy: UserProfile;
  shares: {
    user: UserProfile;
    amount: number;
  }[];
}

export interface Balance {
  user: UserProfile;
  paid: number;
  spent: number;
  balance: number;
}

export interface Settlement {
  from: UserProfile;
  to: UserProfile;
  amount: number;
}
