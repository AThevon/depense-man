import { MonthlyExpense } from './types';
import { addMonths, isSameMonth, isBefore, isAfter, startOfMonth } from 'date-fns';

/**
 * Calcule si un crédit est actif à une date donnée
 * Le crédit expire le jour après le dernier prélèvement
 */
export function isCreditActiveAtDate(expense: MonthlyExpense, targetDate: Date): boolean {
  if (!expense.isCredit || !expense.creditStartDate || !expense.creditDuration) {
    return false;
  }

  const startDate = new Date(expense.creditStartDate);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();

  // Calculer le mois du dernier prélèvement (début + durée - 1)
  const lastPaymentMonthIndex = startMonth + expense.creditDuration - 1;
  const lastPaymentYear = startYear + Math.floor(lastPaymentMonthIndex / 12);
  const lastPaymentMonth = lastPaymentMonthIndex % 12;

  // Créer la date du dernier prélèvement avec le jour exact
  const lastPaymentDate = new Date(lastPaymentYear, lastPaymentMonth, expense.dayOfMonth, 12, 0, 0);

  // Le crédit est actif jusqu'au jour du dernier prélèvement (inclus)
  return targetDate >= startDate && targetDate <= lastPaymentDate;
}

/**
 * Calcule le nombre de paiements effectués jusqu'à une date donnée
 */
export function getPaymentsMadeUntil(expense: MonthlyExpense, untilDate: Date): number {
  if (!expense.isCredit || !expense.creditStartDate || !expense.creditDuration) {
    return 0;
  }

  const startDate = startOfMonth(new Date(expense.creditStartDate));
  const until = startOfMonth(untilDate);

  let paymentsMade = 0;
  let currentMonth = startDate;

  while ((isSameMonth(currentMonth, until) || isBefore(currentMonth, until)) && paymentsMade < expense.creditDuration) {
    const isPaymentDayPassed = until.getDate() >= expense.dayOfMonth || isAfter(until, currentMonth);

    if (isBefore(currentMonth, until) || (isSameMonth(currentMonth, until) && isPaymentDayPassed)) {
      paymentsMade++;
    }

    currentMonth = addMonths(currentMonth, 1);
  }

  return Math.min(paymentsMade, expense.creditDuration);
}

/**
 * Interface pour les informations de crédit à une date donnée
 */
export interface CreditInfoAtDate {
  monthlyAmount: number;
  totalAmount: number;
  remainingAmount: number;
  remainingPayments: number;
  paymentsMade: number;
  isActive: boolean;
  progressPercentage: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Calcule les informations d'un crédit à une date donnée
 */
export function calculateCreditInfoAtDate(expense: MonthlyExpense, atDate: Date = new Date()): CreditInfoAtDate | null {
  if (!expense.isCredit || !expense.totalCreditAmount || !expense.creditDuration || !expense.creditStartDate) {
    return null;
  }

  const monthlyAmount = expense.totalCreditAmount / expense.creditDuration;
  const startDate = startOfMonth(new Date(expense.creditStartDate));

  // Calculer la date de fin correcte : dernier mois de paiement + jour du prélèvement
  const lastPaymentMonth = addMonths(startDate, expense.creditDuration - 1);
  const endDate = new Date(lastPaymentMonth.getFullYear(), lastPaymentMonth.getMonth(), expense.dayOfMonth, 23, 59, 59);

  const isActive = isCreditActiveAtDate(expense, atDate);
  const paymentsMade = getPaymentsMadeUntil(expense, atDate);
  const remainingPayments = Math.max(0, expense.creditDuration - paymentsMade);
  const remainingAmount = monthlyAmount * remainingPayments;
  const progressPercentage = (paymentsMade / expense.creditDuration) * 100;

  return {
    monthlyAmount,
    totalAmount: expense.totalCreditAmount,
    remainingAmount,
    remainingPayments,
    paymentsMade,
    isActive,
    progressPercentage,
    startDate,
    endDate
  };
}

/**
 * Calcule le montant mensuel d'une dépense à une date donnée
 * (gère automatiquement les crédits actifs/inactifs)
 */
export function getExpenseAmountAtDate(expense: MonthlyExpense, atDate: Date = new Date()): number {
  if (!expense.isCredit) {
    return expense.amount;
  }

  if (!isCreditActiveAtDate(expense, atDate)) {
    return 0; // Crédit terminé ou pas encore commencé
  }

  const creditInfo = calculateCreditInfoAtDate(expense, atDate);
  return creditInfo?.monthlyAmount || 0;
}

/**
 * Calcule le total des dépenses pour un mois donné
 */
export function calculateTotalExpensesForMonth(expenses: MonthlyExpense[], forDate: Date): number {
  return expenses.reduce((sum, expense) => {
    return sum + getExpenseAmountAtDate(expense, forDate);
  }, 0);
}

/**
 * Génère les prédictions de dépenses pour les N prochains mois
 */
export function generateExpensePredictions(
  expenses: MonthlyExpense[],
  monthsAhead: number = 12,
  startDate: Date = new Date()
): Array<{ month: Date; totalExpenses: number; details: Array<{ expense: MonthlyExpense; amount: number }> }> {
  const predictions = [];

  for (let i = 0; i < monthsAhead; i++) {
    const targetMonth = addMonths(startDate, i);
    const details = expenses.map(expense => ({
      expense,
      amount: getExpenseAmountAtDate(expense, targetMonth)
    })).filter(d => d.amount > 0);

    const totalExpenses = details.reduce((sum, d) => sum + d.amount, 0);

    predictions.push({
      month: targetMonth,
      totalExpenses,
      details
    });
  }

  return predictions;
}
