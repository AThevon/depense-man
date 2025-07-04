import { LucideIcon } from 'lucide-react';

export interface BaseMonthlyItem {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dayOfMonth: number; // 1-31
  icon: string; // Lucide icon name
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyIncome extends BaseMonthlyItem {
  type: 'income';
}

export interface MonthlyExpense extends BaseMonthlyItem {
  type: 'expense';
  isCredit: boolean;
  remainingPayments?: number; // Only for credit payments
  totalPayments?: number; // Total payments for credit
}

export type MonthlyItem = MonthlyIncome | MonthlyExpense;

export interface MonthlyCalculation {
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
  items: MonthlyItem[];
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface FormData {
  name: string;
  amount: string;
  dayOfMonth: string;
  icon: string;
  isCredit: boolean;
  remainingPayments?: string;
  totalPayments?: string;
}

export interface FormErrors {
  name?: string;
  amount?: string;
  dayOfMonth?: string;
  icon?: string;
  remainingPayments?: string;
  totalPayments?: string;
}

export interface IconOption {
  name: string;
  icon: LucideIcon;
  category: 'income' | 'expense' | 'general';
}

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  outcome: 'accepted' | 'dismissed';
}

export interface FirestoreConfig {
  collection: string;
  enablePersistence: boolean;
}

export interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  firestore: FirestoreConfig;
  auth: {
    allowedEmails: string[];
  };
}

export type SortBy = 'name' | 'amount' | 'dayOfMonth' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface FilterConfig {
  type: 'all' | 'income' | 'expense';
  showOnlyCredits: boolean;
  showOnlyRegular: boolean;
}

export interface ViewConfig {
  sort: SortConfig;
  filter: FilterConfig;
}

// Utility types
export type CreateMonthlyItemInput = Omit<MonthlyItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMonthlyItemInput = Partial<Omit<MonthlyItem, 'id' | 'userId' | 'createdAt'>> & { id: string };

// Form validation
export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

// Hook return types
export interface UseMonthlyItemsReturn {
  items: MonthlyItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: CreateMonthlyItemInput) => Promise<void>;
  updateItem: (item: UpdateMonthlyItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  calculation: MonthlyCalculation;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} 