'use client';

import { useState, useEffect, memo, useMemo, Suspense, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { MonthlyItem, MonthlyExpense } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/spinner';
import { motion } from 'motion/react';
import {
  Zap,
  Target,
  Calendar,
  AlertTriangle,
  Sparkles,
  Flame,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard
} from 'lucide-react';
import type { StatsWorkerOutput } from '@/lib/workers/stats.worker';

// Lazy load des graphiques
const ResponsiveLine = dynamic(() => import('@nivo/line').then(mod => mod.ResponsiveLine), { ssr: false });
const ResponsivePie = dynamic(() => import('@nivo/pie').then(mod => mod.ResponsivePie), { ssr: false });

interface StatsPageProps {
  items: MonthlyItem[];
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

// Cache global pour éviter de recalculer
let cachedData: StatsWorkerOutput | null = null;
let cachedKey = '';

// Composant mémoïsé pour le graphique des prédictions
const PredictionsChart = memo(({ predictions }: { predictions: Array<{ month: string; revenus: number; dépenses: number; solde: number }> }) => (
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
        text: {
          fill: '#e5e7eb',
          fontSize: 11
        },
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
));
PredictionsChart.displayName = 'PredictionsChart';

// Composant mémoïsé pour le graphique Cash Flow
const CashFlowChart = memo(({ cashFlowData }: { cashFlowData: Array<{ day: string; income: number; expense: number; balance: number }> }) => (
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
        text: {
          fill: '#e5e7eb',
          fontSize: 11
        },
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
));
CashFlowChart.displayName = 'CashFlowChart';

// Composant mémoïsé pour le pie chart de distribution
const ExpensesPieChart = memo(({ expensesByIcon }: { expensesByIcon: Array<{ name: string; value: number; icon: string }> }) => (
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
        text: {
          fill: '#e5e7eb',
          fontSize: 11
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
));
ExpensesPieChart.displayName = 'ExpensesPieChart';

const StatsPageWithWorker = ({ items, totalIncome, totalExpenses, remaining }: StatsPageProps) => {
  const [includeCredits, setIncludeCredits] = useState(true);
  const [workerData, setWorkerData] = useState<StatsWorkerOutput | null>(cachedData);
  const [visibleSections, setVisibleSections] = useState<number[]>([]);

  // Créer un identifiant stable pour détecter les changements
  const itemsKey = useMemo(() =>
    items.map(i => `${i.id}-${i.amount}`).join(','),
    [items]
  );

  useEffect(() => {
    // Créer une clé unique pour le cache (sans includeCredits)
    const cacheKey = `${itemsKey}-${totalIncome}-${totalExpenses}-${remaining}`;

    // Si les données sont déjà en cache, pas besoin de recalculer
    if (cachedKey === cacheKey && cachedData) {
      startTransition(() => {
        setWorkerData(cachedData);
      });
      return;
    }

    const worker = new Worker(new URL('@/lib/workers/stats.worker.ts', import.meta.url), {
      type: 'module'
    });

    // Toujours inclure les crédits dans le calcul du worker
    worker.postMessage({ items, totalIncome, totalExpenses, remaining, includeCredits: true });

    worker.onmessage = (e: MessageEvent<StatsWorkerOutput>) => {
      // Mettre en cache
      cachedData = e.data;
      cachedKey = cacheKey;

      // Utiliser startTransition pour ne pas bloquer l'UI
      startTransition(() => {
        setWorkerData(e.data);
      });
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      worker.terminate();
    };

    return () => {
      worker.terminate();
    };
  }, [items, itemsKey, totalIncome, totalExpenses, remaining]);

  // Filtrer les données du pie chart côté client selon le toggle
  const pieChartData = useMemo(() => {
    if (!workerData) return [];
    if (includeCredits) return workerData.expensesByIcon;

    // Filtrer les crédits manuellement
    return workerData.expensesByIcon.filter(expense => {
      const item = items.find(i => i.name === expense.name && i.type === 'expense') as MonthlyExpense | undefined;
      return !item?.isCredit;
    });
  }, [workerData, includeCredits, items]);

  // Monter progressivement les sections quand les données sont prêtes
  useEffect(() => {
    if (!workerData) {
      setVisibleSections([]);
      return;
    }

    // Reset et monter progressivement les sections
    setVisibleSections([]);
    const sections = [0, 1, 2, 3, 4, 5]; // Cards, Predictions, CashFlow, Distribution, Critical, Others

    sections.forEach((section, index) => {
      setTimeout(() => {
        setVisibleSections(prev => [...prev, section]);
      }, section === 0 ? 0 : 400 + (index - 1) * 150); // Cards instantanées puis 150ms entre les autres
    });
  }, [workerData]);

  // Calcul du score de santé financière (léger, pas besoin du worker)
  const healthScore = totalIncome === 0 ? 0 : Math.round(Math.max(0, Math.min(100, (remaining / totalIncome) * 100)));

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

  const getRemainingColor = (remaining: number) => {
    if (remaining > 0) return 'text-success';
    if (remaining < 0) return 'text-destructive';
    return 'text-primary';
  };


  const metricCards = [
    { icon: TrendingUp, iconColor: 'text-success', title: 'Revenus', value: formatAmount(totalIncome), valueColor: 'text-success', subtitle: 'Total mensuel' },
    { icon: TrendingDown, iconColor: 'text-destructive', title: 'Dépenses', value: formatAmount(totalExpenses), valueColor: 'text-destructive', subtitle: 'Total mensuel' },
    { icon: DollarSign, iconColor: 'text-primary', title: 'Solde', value: formatAmount(remaining), valueColor: getRemainingColor(remaining), subtitle: 'Après dépenses' },
    { icon: CreditCard, iconColor: 'text-primary', title: 'Crédits', value: workerData?.creditTimeline.filter(c => c.isActive).length || 0, valueColor: 'text-primary', subtitle: 'En cours' },
    { icon: Sparkles, iconColor: 'text-primary', title: 'Santé financière', value: `${healthScore}/100`, valueColor: getHealthColor(healthScore), subtitle: getHealthLabel(healthScore) },
    { icon: Zap, iconColor: 'text-warning', title: 'Vélocité', value: workerData ? formatAmount(workerData.dailyVelocity) : null, valueColor: 'text-foreground', subtitle: 'par jour' },
    { icon: Target, iconColor: 'text-primary', title: 'Runway', value: workerData ? workerData.runway.toFixed(1) : null, valueColor: 'text-foreground', subtitle: 'mois d\'autonomie' },
    { icon: Flame, iconColor: 'text-destructive', title: 'Burn Rate', value: formatAmount(totalExpenses), valueColor: 'text-destructive', subtitle: 'par mois' },
  ];

  return (
    <div className="space-y-4 pb-4 min-h-screen">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return visibleSections.includes(0) ? (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="flex"
            >
              <Card className="flex flex-col flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                    <h3 className="font-semibold text-sm">{card.title}</h3>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  {card.value === null ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${card.valueColor}`}>
                        {card.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : null;
        })}
      </div>

      {/* Prédictions 12 mois */}
      {visibleSections.includes(1) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Prédictions 12 mois</h3>
              {workerData && (
                <p className="text-sm text-muted-foreground">
                  Projection incluant les fins de crédits
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!workerData ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : (
                <Suspense fallback={
                  <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                  </div>
                }>
                  <PredictionsChart predictions={workerData.predictions} />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cash Flow quotidien */}
      {visibleSections.includes(2) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Cash Flow mensuel</h3>
              {workerData && (
                <p className="text-sm text-muted-foreground">
                  Évolution du solde jour par jour
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!workerData ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : (
                <Suspense fallback={
                  <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                  </div>
                }>
                  <CashFlowChart cashFlowData={workerData.cashFlowData} />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Distribution et Top 5 */}
      {visibleSections.includes(3) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="grid lg:grid-cols-2 gap-4"
        >
        <Card>
          <CardHeader>
            {workerData ? (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Distribution des dépenses</h3>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm text-muted-foreground">Inclure crédits</span>
                  <Switch
                    checked={includeCredits}
                    onCheckedChange={setIncludeCredits}
                  />
                </label>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-foreground">Distribution des dépenses</h3>
            )}
          </CardHeader>
          <CardContent>
            {!workerData ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                  <Spinner size="lg" />
                </div>
              }>
                <ExpensesPieChart expensesByIcon={pieChartData} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Top 5 dépenses</h3>
          </CardHeader>
          <CardContent>
            {!workerData ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {workerData.topExpenses.map((expense, index) => (
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
            )}
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Jours critiques */}
      {visibleSections.includes(4) && workerData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
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
              {workerData.criticalDays.map((critical) => (
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
        </motion.div>
      )}

      {/* Petites dépenses récurrentes */}
      {visibleSections.includes(5) && workerData && workerData.smallRecurringExpenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
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
                  {formatAmount(workerData.totalSmallExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  total mensuel
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workerData.smallRecurringExpenses.map((expense) => (
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
        </motion.div>
      )}

      {/* Timeline des crédits */}
      {visibleSections.includes(5) && workerData && workerData.creditTimeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Timeline des crédits</h3>
            <p className="text-sm text-muted-foreground">
              Quand vos crédits se termineront
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workerData.creditTimeline.map((credit) => (
                <div key={credit.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${credit.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {credit.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Fin: {credit.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="bg-muted rounded-full h-2">
                        <div
                          className={`h-full rounded-full transition-all ${credit.isActive ? 'bg-primary' : 'bg-muted-foreground'}`}
                          style={{ width: `${credit.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{credit.paymentsMade} / {credit.totalPayments} paiements</span>
                        <span>{Math.round(credit.progress)}%</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold min-w-[80px] text-right">
                      {formatAmount(credit.remaining)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}
    </div>
  );
};

export default memo(StatsPageWithWorker);
