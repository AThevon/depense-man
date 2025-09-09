'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { MonthlyItem, MonthlyExpense, calculateCreditInfo } from '@/lib/types';
import { Button } from '@/components/ui/ibutton';
import { Card } from '@/components/ui/icard';

interface CalendarProps {
  items: MonthlyItem[];
}

interface DayData {
  date: number;
  isCurrentMonth: boolean;
  income: number;
  expense: number;
  total: number;
  items: MonthlyItem[];
}

const Calendar = ({ items }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarDays, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    const startDay = (firstDay.getDay() + 6) % 7; // Convertir pour que lundi = 0
    
    const days: DayData[] = [];
    
    // Jours du mois précédent
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = prevMonth.getDate() - i;
      days.push({
        date,
        isCurrentMonth: false,
        income: 0,
        expense: 0,
        total: 0,
        items: []
      });
    }
    
    // Jours du mois actuel
    for (let date = 1; date <= lastDay.getDate(); date++) {
      const dayItems = items.filter(item => item.dayOfMonth === date);
      const income = dayItems.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
      
      // Calculer les dépenses en prenant en compte les crédits terminés
      const expense = dayItems.filter(item => item.type === 'expense').reduce((sum, item) => {
        const expenseItem = item as MonthlyExpense;
        if (expenseItem.isCredit) {
          const creditInfo = calculateCreditInfo(expenseItem);
          if (creditInfo && creditInfo.isActive) {
            return sum + creditInfo.monthlyAmount;
          }
          return sum; // Crédit terminé, pas de prélèvement
        }
        return sum + item.amount;
      }, 0);
      
      days.push({
        date,
        isCurrentMonth: true,
        income,
        expense,
        total: income - expense,
        items: dayItems
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const totalCells = 42; // 6 semaines * 7 jours
    const remainingCells = totalCells - days.length;
    for (let date = 1; date <= remainingCells; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        income: 0,
        expense: 0,
        total: 0,
        items: []
      });
    }
    
    return {
      calendarDays: days,
      monthName: firstDay.toLocaleDateString('fr-FR', { month: 'long' }),
      year
    };
  }, [currentDate, items]);

  // Calculer les prévisions par cycle de paye
  const predictions = useMemo(() => {
    const today = new Date();
    const payDay = 29; // Jour de paye standard
    
    // Trouver le dernier jour de paye qui est passé
    let currentCycleStart: Date;
    if (today.getDate() >= payDay) {
      // On est après le jour de paye du mois actuel
      currentCycleStart = new Date(today.getFullYear(), today.getMonth(), payDay);
    } else {
      // On est avant le jour de paye, donc le cycle a commencé le mois précédent
      currentCycleStart = new Date(today.getFullYear(), today.getMonth() - 1, payDay);
    }
    
    const predictions: Array<{
      startDate: Date;
      endDate: Date;
      totalIncome: number;
      totalExpense: number;
      balance: number;
    }> = [];

    // Calculer les 12 prochains cycles de paye
    for (let i = 0; i < 12; i++) {
      const cycleStart = new Date(currentCycleStart.getFullYear(), currentCycleStart.getMonth() + i, payDay);
      const cycleEnd = new Date(currentCycleStart.getFullYear(), currentCycleStart.getMonth() + i + 1, payDay - 1);
      
      const cycleIncome = items.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
      
      // Pour chaque cycle, calculer les dépenses en tenant compte des crédits qui peuvent expirer
      const cycleExpense = items.filter(item => item.type === 'expense').reduce((sum, item) => {
        const expenseItem = item as MonthlyExpense;
        if (expenseItem.isCredit) {
          const startDate = new Date(expenseItem.creditStartDate!);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + expenseItem.creditDuration!);
          
          // Vérifier si le crédit sera encore actif au moment du prélèvement (durant le cycle)
          // Le crédit est prélevé pendant le cycle, donc on vérifie si il sera actif pendant cette période
          // Si le crédit se termine avant le début du cycle, il ne sera pas prélevé
          if (endDate > cycleStart) {
            const creditInfo = calculateCreditInfo(expenseItem);
            if (creditInfo && creditInfo.monthlyAmount > 0) {
              return sum + creditInfo.monthlyAmount;
            }
          }
          return sum;
        }
        return sum + item.amount;
      }, 0);

              const balance = cycleIncome - cycleExpense;

        predictions.push({
          startDate: cycleStart,
          endDate: cycleEnd,
          totalIncome: cycleIncome,
          totalExpense: cycleExpense,
          balance: balance
        });
    }

    return predictions;
  }, [items]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDayColor = (day: DayData, isToday: boolean) => {
    if (!day.isCurrentMonth) return 'text-muted-foreground';
    if (isToday) return 'text-primary-foreground';
    if (day.total > 0) return 'text-success';
    if (day.total < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getDayBgColor = (day: DayData, isToday: boolean) => {
    if (!day.isCurrentMonth) return 'bg-muted/50';
    if (isToday) return 'bg-primary';
    if (day.items.length > 0) return 'bg-accent';
    return 'bg-card';
  };

  return (
    <Card className="w-full">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground capitalize">
            {monthName} {year}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const today = new Date();
            const isToday = day.isCurrentMonth && 
              day.date === today.getDate() && 
              currentDate.getMonth() === today.getMonth() && 
              currentDate.getFullYear() === today.getFullYear();
            
            return (
              <div
                key={index}
                className={`
                  min-h-16 md:min-h-20 p-1 md:p-2 border border-border rounded-lg
                  ${getDayBgColor(day, isToday)}
                  ${day.isCurrentMonth && !isToday ? 'hover:bg-muted/30' : ''}
                  transition-colors
                `}
              >
                <div className="flex flex-col h-full">
                  {/* Numéro du jour */}
                  <div className={`text-sm font-medium ${getDayColor(day, isToday)}`}>
                    {day.date}
                  </div>

                  {/* Montants */}
                  {day.isCurrentMonth && day.items.length > 0 && (
                    <div className="flex-1 flex flex-col justify-center space-y-1">
                      {day.income > 0 && (
                        <div className={`flex items-center text-xs ${isToday ? 'text-primary-foreground' : 'text-primary'}`}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span className="font-medium">
                            {formatAmount(day.income)}
                          </span>
                        </div>
                      )}
                      {day.expense > 0 && (
                        <div className={`flex items-center text-xs ${isToday ? 'text-primary-foreground' : 'text-destructive'}`}>
                          <TrendingDown className="h-3 w-3 mr-1" />
                          <span className="font-medium">
                            {formatAmount(day.expense)}
                          </span>
                        </div>
                      )}
                      {day.total !== 0 && (
                        <div className={`text-xs font-bold ${getDayColor(day, isToday)}`}>
                          {formatAmount(day.total)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent border border-border rounded"></div>
            <span className="text-muted-foreground">Jours avec transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-muted-foreground">Aujourd&apos;hui</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Revenus</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-muted-foreground">Dépenses</span>
          </div>
        </div>

        {/* Prévisions par cycle de paye */}
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Prévisions 12 mois (29 → 28)
          </h3>
          
          {/* Version desktop - tableau */}
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-2">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg text-center"
                >
                  <div className="font-medium text-foreground text-sm">
                    {prediction.startDate.toLocaleDateString('fr-FR', { month: 'short' })} (29 → 28)
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatAmount(prediction.totalIncome)} - {formatAmount(prediction.totalExpense)}
                  </div>
                  <div className={`font-bold text-sm ${
                    prediction.balance > 0 ? 'text-success' : 
                    prediction.balance < 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {formatAmount(prediction.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version mobile - liste compacte */}
          <div className="md:hidden">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">
                      {prediction.startDate.toLocaleDateString('fr-FR', { month: 'short' })} (29 → 28)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatAmount(prediction.totalIncome)} - {formatAmount(prediction.totalExpense)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${
                      prediction.balance > 0 ? 'text-success' : 
                      prediction.balance < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {formatAmount(prediction.balance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Calendar; 