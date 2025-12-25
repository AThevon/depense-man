import { MonthlyItem, MonthlyExpense } from '../types';
import { calculateCreditInfoAtDate } from '../creditCalculations';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface StatsWorkerInput {
  items: MonthlyItem[];
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
  includeCredits: boolean;
}

export interface StatsWorkerOutput {
  predictions: Array<{ month: string; revenus: number; dépenses: number; solde: number }>;
  expensesByIcon: Array<{ name: string; value: number; icon: string }>;
  topExpenses: Array<{ name: string; value: number; icon: string }>;
  dailyVelocity: number;
  runway: number;
  criticalDays: Array<{ day: number; total: number }>;
  smallRecurringExpenses: Array<{ name: string; amount: number; icon: string; dayOfMonth: number }>;
  totalSmallExpenses: number;
  creditTimeline: Array<{
    name: string;
    endDate: string;
    remaining: number;
    progress: number;
    paymentsMade: number;
    totalPayments: number;
    isActive: boolean;
  }>;
  cashFlowData: Array<{ day: string; income: number; expense: number; balance: number }>;
}

self.onmessage = (e: MessageEvent<StatsWorkerInput>) => {
  const { items, totalIncome, totalExpenses, remaining, includeCredits } = e.data;

  // Prédictions sur 12 mois
  const today = new Date();
  const predictions = [];
  const payDay = 29;

  for (let i = 0; i < 12; i++) {
    const cycleMonth = addMonths(today, i);
    const cycleStartDay = new Date(cycleMonth.getFullYear(), cycleMonth.getMonth(), payDay);
    const cycleEndDay = new Date(cycleMonth.getFullYear(), cycleMonth.getMonth() + 1, 28);
    const monthName = format(cycleEndDay, 'MMMM yyyy', { locale: fr });

    const monthExpenses = items
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => {
        const expenseItem = item as MonthlyExpense;
        if (expenseItem.isCredit) {
          const dayOfPayment = expenseItem.dayOfMonth;
          let paymentDate: Date;
          if (dayOfPayment >= 29) {
            paymentDate = new Date(cycleStartDay.getFullYear(), cycleStartDay.getMonth(), dayOfPayment, 12, 0, 0);
          } else {
            paymentDate = new Date(cycleEndDay.getFullYear(), cycleEndDay.getMonth(), dayOfPayment, 12, 0, 0);
          }
          const creditInfo = calculateCreditInfoAtDate(expenseItem, paymentDate);
          if (creditInfo?.isActive) {
            return sum + creditInfo.monthlyAmount;
          }
          return sum;
        }
        return sum + item.amount;
      }, 0);

    predictions.push({
      month: monthName,
      revenus: totalIncome,
      dépenses: monthExpenses,
      solde: totalIncome - monthExpenses
    });
  }

  // Distribution par type de dépense
  const grouped = items
    .filter(item => item.type === 'expense')
    .reduce((acc, item) => {
      const expenseItem = item as MonthlyExpense;

      if (expenseItem.isCredit && !includeCredits) {
        return acc;
      }

      let amount = item.amount;

      if (expenseItem.isCredit && includeCredits) {
        const creditInfo = calculateCreditInfoAtDate(expenseItem);
        if (creditInfo?.isActive) {
          amount = creditInfo.monthlyAmount;
        } else {
          return acc;
        }
      }

      if (!acc[item.name]) {
        acc[item.name] = { name: item.name, value: 0, icon: item.icon };
      }
      acc[item.name].value += amount;
      return acc;
    }, {} as Record<string, { name: string; value: number; icon: string }>);

  const expensesByIcon = Object.values(grouped).sort((a, b) => b.value - a.value);
  const topExpenses = expensesByIcon.slice(0, 5);

  // Vélocité de dépense
  const dailyVelocity = totalExpenses / 30;

  // Runway
  const runway = remaining <= 0 || totalExpenses === 0 ? 0 : remaining / totalExpenses;

  // Jours critiques
  const dayTotals: Record<number, number> = {};
  items
    .filter(item => item.type === 'expense')
    .forEach(item => {
      const expenseItem = item as MonthlyExpense;
      let amount = item.amount;

      if (expenseItem.isCredit) {
        const creditInfo = calculateCreditInfoAtDate(expenseItem);
        if (creditInfo?.isActive) {
          amount = creditInfo.monthlyAmount;
        } else {
          return;
        }
      }

      const day = item.dayOfMonth;
      dayTotals[day] = (dayTotals[day] || 0) + amount;
    });

  const criticalDays = Object.entries(dayTotals)
    .map(([day, total]) => ({ day: parseInt(day), total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Petites dépenses récurrentes
  const smallRecurringExpenses = items
    .filter(item => item.type === 'expense')
    .map(item => item as MonthlyExpense)
    .filter(item => !item.isCredit && item.amount < 20)
    .map(item => ({
      name: item.name,
      amount: item.amount,
      icon: item.icon,
      dayOfMonth: item.dayOfMonth
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalSmallExpenses = smallRecurringExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Timeline des crédits
  const creditTimeline = items
    .filter(item => item.type === 'expense')
    .map(item => item as MonthlyExpense)
    .filter(item => item.isCredit)
    .map(item => {
      const creditInfo = calculateCreditInfoAtDate(item);
      if (!creditInfo) return null;

      const startDate = new Date(item.creditStartDate!);
      const lastPaymentMonth = addMonths(startDate, item.creditDuration! - 1);
      const lastPaymentDate = new Date(lastPaymentMonth.getFullYear(), lastPaymentMonth.getMonth(), item.dayOfMonth);

      return {
        name: item.name,
        endDate: format(lastPaymentDate, 'dd MMM yyyy', { locale: fr }),
        remaining: creditInfo.remainingAmount,
        progress: creditInfo.progressPercentage,
        paymentsMade: creditInfo.paymentsMade,
        totalPayments: item.creditDuration!,
        isActive: creditInfo.isActive
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a!.isActive && !b!.isActive) return -1;
      if (!a!.isActive && b!.isActive) return 1;
      return 0;
    }) as Array<{
      name: string;
      endDate: string;
      remaining: number;
      progress: number;
      paymentsMade: number;
      totalPayments: number;
      isActive: boolean;
    }>;

  // Cash flow par jour du cycle de paye
  const cycleDays: number[] = [];
  for (let d = 29; d <= 31; d++) {
    cycleDays.push(d);
  }
  for (let d = 1; d <= 28; d++) {
    cycleDays.push(d);
  }

  const dailyFlow: Array<{ day: string; income: number; expense: number; balance: number }> = [];
  cycleDays.forEach(d => {
    dailyFlow.push({ day: d.toString(), income: 0, expense: 0, balance: 0 });
  });

  items.forEach(item => {
    const day = item.dayOfMonth;
    const expenseItem = item as MonthlyExpense;
    const dayIndex = cycleDays.indexOf(day);
    if (dayIndex === -1) return;

    if (item.type === 'income') {
      dailyFlow[dayIndex].income += item.amount;
    } else {
      let amount = item.amount;
      if (expenseItem.isCredit) {
        const creditInfo = calculateCreditInfoAtDate(expenseItem);
        if (creditInfo?.isActive) {
          amount = creditInfo.monthlyAmount;
        } else {
          return;
        }
      }
      dailyFlow[dayIndex].expense += amount;
    }
  });

  let cumulativeBalance = 0;
  const cashFlowData = dailyFlow.map(day => {
    cumulativeBalance += day.income - day.expense;
    return { ...day, balance: cumulativeBalance };
  });

  const result: StatsWorkerOutput = {
    predictions,
    expensesByIcon,
    topExpenses,
    dailyVelocity,
    runway,
    criticalDays,
    smallRecurringExpenses,
    totalSmallExpenses,
    creditTimeline,
    cashFlowData,
  };

  self.postMessage(result);
};

export {};
