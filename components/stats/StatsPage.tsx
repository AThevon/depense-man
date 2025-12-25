'use client';

import { useMemo, useState, memo } from 'react';
import { MonthlyItem, MonthlyExpense} from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import {
  Zap,
  Target,
  Calendar,
  AlertTriangle,
  Sparkles,
  Flame
} from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { format, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StatsPageProps {
  items: MonthlyItem[];
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const StatsPage = ({ items, totalIncome, totalExpenses, remaining }: StatsPageProps) => {
  const [includeCredits, setIncludeCredits] = useState(true);

  // Calcul du score de santé financière (0-100)
  const healthScore = useMemo(() => {
    if (totalIncome === 0) return 0;
    const savingsRate = (remaining / totalIncome) * 100;
    const score = Math.max(0, Math.min(100, savingsRate));
    return Math.round(score);
  }, [remaining, totalIncome]);

  // Prédictions sur 12 mois (cycles de paye du 29 au 28)
  const predictions = useMemo(() => {
    const today = new Date();
    const predictions = [];
    const payDay = 29;

    for (let i = 0; i < 12; i++) {
      // Calculer le début du cycle de paye (le 29 du mois)
      const cycleMonth = addMonths(today, i);
      const cycleStartDay = new Date(cycleMonth.getFullYear(), cycleMonth.getMonth(), payDay);
      // La fin du cycle (le 28 du mois suivant)
      const cycleEndDay = new Date(cycleMonth.getFullYear(), cycleMonth.getMonth() + 1, 28);

      // Le nom du cycle est le mois où tombe le 28 (fin du cycle)
      const monthName = format(cycleEndDay, 'MMMM yyyy', { locale: fr });

      // Calculer les dépenses pour ce cycle
      const monthExpenses = items
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => {
          const expenseItem = item as MonthlyExpense;
          if (expenseItem.isCredit) {
            // Pour un crédit, vérifier s'il sera prélevé pendant ce cycle
            // Le prélèvement se fait le jour `dayOfMonth` du mois
            // Il faut vérifier si ce jour tombe dans le cycle (29 → 28)
            const dayOfPayment = expenseItem.dayOfMonth;

            // Le jour de prélèvement tombe-t-il dans ce cycle ?
            let paymentDate: Date;
            if (dayOfPayment >= 29) {
              // Prélèvement dans la première partie du cycle (même mois que cycleStartDay)
              paymentDate = new Date(cycleStartDay.getFullYear(), cycleStartDay.getMonth(), dayOfPayment, 12, 0, 0);
            } else {
              // Prélèvement dans la deuxième partie (mois suivant)
              paymentDate = new Date(cycleEndDay.getFullYear(), cycleEndDay.getMonth(), dayOfPayment, 12, 0, 0);
            }

            // Vérifier si le crédit est actif à la date de prélèvement
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

    return predictions;
  }, [items, totalIncome]);

  // Distribution par type de dépense
  const expensesByIcon = useMemo(() => {
    const grouped = items
      .filter(item => item.type === 'expense')
      .reduce((acc, item) => {
        const expenseItem = item as MonthlyExpense;

        // Si c'est un crédit et qu'on ne veut pas les inclure, skip
        if (expenseItem.isCredit && !includeCredits) {
          return acc;
        }

        let amount = item.amount;

        if (expenseItem.isCredit && includeCredits) {
          const creditInfo = calculateCreditInfoAtDate(expenseItem);
          if (creditInfo?.isActive) {
            amount = creditInfo.monthlyAmount;
          } else {
            return acc; // Crédit inactif
          }
        }

        if (!acc[item.name]) {
          acc[item.name] = { name: item.name, value: 0, icon: item.icon };
        }
        acc[item.name].value += amount;
        return acc;
      }, {} as Record<string, { name: string; value: number; icon: string }>);

    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [items, includeCredits]);

  // Top 5 dépenses
  const topExpenses = useMemo(() => {
    return expensesByIcon.slice(0, 5);
  }, [expensesByIcon]);

  // Vélocité de dépense (par jour)
  const dailyVelocity = useMemo(() => {
    return totalExpenses / 30;
  }, [totalExpenses]);

  // Runway (nombre de mois)
  const runway = useMemo(() => {
    if (remaining <= 0 || totalExpenses === 0) return 0;
    return remaining / totalExpenses;
  }, [remaining, totalExpenses]);

  // Jours critiques (jours avec le plus de dépenses)
  const criticalDays = useMemo(() => {
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

    return Object.entries(dayTotals)
      .map(([day, total]) => ({ day: parseInt(day), total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [items]);

  // Petites dépenses récurrentes (< 20€)
  const smallRecurringExpenses = useMemo(() => {
    return items
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
  }, [items]);

  const totalSmallExpenses = useMemo(() => {
    return smallRecurringExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [smallRecurringExpenses]);

  // Timeline des crédits
  const creditTimeline = useMemo(() => {
    return items
      .filter(item => item.type === 'expense')
      .map(item => item as MonthlyExpense)
      .filter(item => item.isCredit)
      .map(item => {
        const creditInfo = calculateCreditInfoAtDate(item);
        if (!creditInfo) return null;

        // Calculer la vraie date du dernier paiement (pas le cycle suivant)
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
      });
  }, [items]);

  // Cash flow par jour du cycle de paye (du 29 au 28)
  const cashFlowData = useMemo(() => {
    const payDay = 29;
    const dailyFlow: Array<{ day: string; income: number; expense: number; balance: number }> = [];

    // Créer un tableau des jours du cycle : 29, 30, 31, 1, 2, ..., 28
    const cycleDays: number[] = [];
    for (let d = payDay; d <= 31; d++) {
      cycleDays.push(d);
    }
    for (let d = 1; d <= 28; d++) {
      cycleDays.push(d);
    }

    // Initialiser tous les jours du cycle
    cycleDays.forEach(d => {
      dailyFlow.push({ day: d.toString(), income: 0, expense: 0, balance: 0 });
    });

    // Ajouter les transactions
    items.forEach(item => {
      const day = item.dayOfMonth;
      const expenseItem = item as MonthlyExpense;

      // Trouver l'index dans le cycle
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

    // Calculer le solde cumulé
    let cumulativeBalance = 0;
    return dailyFlow.map(day => {
      cumulativeBalance += day.income - day.expense;
      return { ...day, balance: cumulativeBalance };
    });
  }, [items]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 70) return 'Excellente';
    if (score >= 40) return 'Correcte';
    return 'À améliorer';
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Scores et métriques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Santé financière</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}/100
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getHealthLabel(healthScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-warning" />
              <h3 className="font-semibold text-foreground">Vélocité</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatAmount(dailyVelocity)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              par jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Runway</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {runway.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              mois d&apos;autonomie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-destructive" />
              <h3 className="font-semibold text-foreground">Burn Rate</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {formatAmount(totalExpenses)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              par mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prédictions 12 mois */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Prédictions 12 mois</h3>
          <p className="text-sm text-muted-foreground">
            Projection incluant les fins de crédits
          </p>
        </CardHeader>
        <CardContent>
          <div style={{ height: 300 }}>
            <ResponsiveLine
              data={[
                {
                  id: 'revenus',
                  data: predictions.map(p => ({ x: p.month, y: p.revenus }))
                },
                {
                  id: 'dépenses',
                  data: predictions.map(p => ({ x: p.month, y: p.dépenses }))
                },
                {
                  id: 'solde',
                  data: predictions.map(p => ({ x: p.month, y: p.solde }))
                }
              ]}
              margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (value) => `${value}€`,
                legendOffset: -40,
                legendPosition: 'middle'
              }}
              colors={['#10b981', '#ef4444', '#3b82f6']}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              useMesh={true}
              enableArea={true}
              areaOpacity={0.1}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle'
                }
              ]}
              theme={{
                background: 'transparent',
                textColor: '#e5e7eb',
                fontSize: 11,
                axis: {
                  domain: {
                    line: {
                      stroke: '#444444',
                      strokeWidth: 1
                    }
                  },
                  ticks: {
                    line: {
                      stroke: '#444444',
                      strokeWidth: 1
                    },
                    text: {
                      fill: '#e5e7eb'
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#333333',
                    strokeWidth: 1
                  }
                },
                legends: {
                  text: {
                    fill: '#e5e7eb'
                  }
                },
                tooltip: {
                  container: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontSize: 12,
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))'
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow quotidien */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Cash Flow mensuel</h3>
          <p className="text-sm text-muted-foreground">
            Évolution du solde jour par jour
          </p>
        </CardHeader>
        <CardContent>
          <div style={{ height: 300 }}>
            <ResponsiveLine
              data={[
                {
                  id: 'solde',
                  data: cashFlowData.map(d => ({ x: d.day, y: d.balance }))
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (value) => `${value}€`,
                legendOffset: -40,
                legendPosition: 'middle'
              }}
              colors={['#3b82f6']}
              pointSize={6}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              useMesh={true}
              enableArea={true}
              areaOpacity={0.15}
              theme={{
                background: 'transparent',
                textColor: '#e5e7eb',
                fontSize: 11,
                axis: {
                  domain: {
                    line: {
                      stroke: '#444444',
                      strokeWidth: 1
                    }
                  },
                  ticks: {
                    line: {
                      stroke: '#444444',
                      strokeWidth: 1
                    },
                    text: {
                      fill: '#e5e7eb'
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#333333',
                    strokeWidth: 1
                  }
                },
                tooltip: {
                  container: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontSize: 12,
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))'
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Distribution et Top 5 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Distribution des dépenses</h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-sm text-muted-foreground">Inclure crédits</span>
                <input
                  type="checkbox"
                  checked={includeCredits}
                  onChange={(e) => setIncludeCredits(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsivePie
                data={expensesByIcon.map((item, index) => ({
                  id: item.name,
                  label: item.name,
                  value: item.value,
                  color: COLORS[index % COLORS.length]
                }))}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#e5e7eb"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#ffffff"
                theme={{
                  background: 'transparent',
                  textColor: '#e5e7eb',
                  fontSize: 11,
                  tooltip: {
                    container: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      fontSize: 12,
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))'
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Top 5 dépenses</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div key={expense.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{expense.name}</span>
                  </div>
                  <span className="text-destructive font-semibold">
                    {formatAmount(expense.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jours critiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Jours critiques</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Jours avec le plus de dépenses
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {criticalDays.map((critical) => (
              <div
                key={critical.day}
                className="flex flex-col items-center justify-center p-4 bg-destructive/10 rounded-lg border border-destructive/20"
              >
                <Calendar className="h-5 w-5 text-destructive mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {critical.day}
                </div>
                <div className="text-sm text-destructive font-semibold mt-1">
                  {formatAmount(critical.total)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Petites dépenses récurrentes */}
      {smallRecurringExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Petites dépenses récurrentes</h3>
                <p className="text-sm text-muted-foreground">
                  Dépenses mensuelles de moins de 20€
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-warning">
                  {formatAmount(totalSmallExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  total mensuel
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {smallRecurringExpenses.map((expense) => (
                <div
                  key={expense.name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={expense.icon} className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{expense.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Le {expense.dayOfMonth} du mois
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-warning">
                    {formatAmount(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline des crédits */}
      {creditTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Timeline des crédits</h3>
            <p className="text-sm text-muted-foreground">
              Quand vos crédits se termineront
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditTimeline.map((credit) => (
                <div key={credit!.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${credit!.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {credit!.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Fin: {credit!.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="bg-muted rounded-full h-2">
                        <div
                          className={`h-full rounded-full transition-all ${credit!.isActive ? 'bg-primary' : 'bg-muted-foreground'}`}
                          style={{ width: `${credit!.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{credit!.paymentsMade} / {credit!.totalPayments} paiements</span>
                        <span>{Math.round(credit!.progress)}%</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold min-w-[80px] text-right">
                      {formatAmount(credit!.remaining)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default memo(StatsPage);
