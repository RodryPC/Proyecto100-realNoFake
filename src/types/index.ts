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
  amount: number; // stored as integer cents
  description: string;
  date: Date;
  paidBy: UserProfile;
  shares: {
    user: UserProfile;
    amount: number; // stored as integer cents
  }[];
}

export interface Balance {
  user: UserProfile;
  paid: number; // stored as integer cents
  spent: number; // stored as integer cents
  balance: number; // stored as integer cents
}

export interface Settlement {
  from: UserProfile;
  to: UserProfile;
  amount: number; // stored as integer cents
}
