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
  totalCreditAmount?: number;  // Montant total du crédit
  creditStartDate?: Date;      // Date de début du crédit
  creditDuration?: number;     // Durée en mois
}

export type MonthlyItem = MonthlyIncome | MonthlyExpense;

export interface MonthlyCalculation {
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
  remainingThisMonth: number;
  items: MonthlyItem[];
  activeCredits: {
    count: number;
    totalRemaining: number;
    totalMonthly: number;
  };
  currentPosition: number;
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
  totalCreditAmount?: string;
  creditStartDate?: string;
  creditDuration?: string;
}

export interface FormErrors {
  name?: string;
  amount?: string;
  dayOfMonth?: string;
  icon?: string;
  totalCreditAmount?: string;
  creditStartDate?: string;
  creditDuration?: string;
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

// Credit calculation utilities
export interface CreditInfo {
  monthlyAmount: number;
  totalAmount: number;
  remainingAmount: number;
  remainingPayments: number;
  isActive: boolean;
  progressPercentage: number;
}

export function calculateCreditInfo(expense: MonthlyExpense): CreditInfo | null {
  if (!expense.isCredit || !expense.totalCreditAmount || !expense.creditDuration || !expense.creditStartDate) {
    return null;
  }

  const monthlyAmount = expense.totalCreditAmount / expense.creditDuration;
  const now = new Date();
  const startDate = new Date(expense.creditStartDate);
  
  // Calculate payments made based on payment cycles
  let paymentsMade = 0;
  const paymentDay = expense.dayOfMonth;
  
  // Calculate how many payment cycles have been completed
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  
  // Count completed payment cycles
  let year = startYear;
  let month = startMonth;
  
  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    // Check if this payment cycle has been completed
    if (year < currentYear || (year === currentYear && month < currentMonth) || 
        (year === currentYear && month === currentMonth && currentDay >= paymentDay)) {
      paymentsMade++;
    }
    
    // Move to next month
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    
    // Don't count more payments than the duration
    if (paymentsMade >= expense.creditDuration) {
      break;
    }
  }
  
  const remainingPayments = Math.max(0, expense.creditDuration - paymentsMade);
  const remainingAmount = monthlyAmount * remainingPayments;
  const isActive = remainingPayments > 0;
  const progressPercentage = (paymentsMade / expense.creditDuration) * 100;

  return {
    monthlyAmount,
    totalAmount: expense.totalCreditAmount,
    remainingAmount,
    remainingPayments,
    isActive,
    progressPercentage
  };
}

import { PAY_DAY } from '@/consts';

// Utility functions for pay cycle calculations
export function getPayCyclePosition(dayOfMonth: number, payDay: number = PAY_DAY): number {
  if (dayOfMonth >= payDay) {
    return dayOfMonth - payDay; // Jours après la paye
  } else {
    return (31 - payDay) + dayOfMonth; // Jours du mois suivant
  }
}

export function getCurrentPayCyclePosition(payDay: number = PAY_DAY): number {
  const today = new Date();
  return getPayCyclePosition(today.getDate(), payDay);
} 