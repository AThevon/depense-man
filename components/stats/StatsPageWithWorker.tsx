'use client';

import { useState, useEffect, memo } from 'react';
import dynamic from 'next/dynamic';
import { MonthlyItem } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/spinner';
import {
  Zap,
  Target,
  Calendar,
  AlertTriangle,
  Sparkles,
  Flame
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

const StatsPageWithWorker = ({ items, totalIncome, totalExpenses, remaining }: StatsPageProps) => {
  const [includeCredits, setIncludeCredits] = useState(true);
  const [workerData, setWorkerData] = useState<StatsWorkerOutput | null>(cachedData);
  const [isLoading, setIsLoading] = useState(cachedData === null);

  useEffect(() => {
    // Créer une clé unique pour le cache
    const cacheKey = `${items.length}-${totalIncome}-${totalExpenses}-${remaining}-${includeCredits}`;

    // Si les données sont déjà en cache, pas besoin de recalculer
    if (cachedKey === cacheKey && cachedData) {
      setWorkerData(cachedData);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const worker = new Worker(new URL('@/lib/workers/stats.worker.ts', import.meta.url), {
      type: 'module'
    });

    worker.postMessage({ items, totalIncome, totalExpenses, remaining, includeCredits });

    worker.onmessage = (e: MessageEvent<StatsWorkerOutput>) => {
      // Mettre en cache
      cachedData = e.data;
      cachedKey = cacheKey;

      setWorkerData(e.data);
      setIsLoading(false);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setIsLoading(false);
      worker.terminate();
    };

    return () => {
      worker.terminate();
    };
  }, [items, totalIncome, totalExpenses, remaining, includeCredits]);

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

  if (isLoading || !workerData) {
    return (
      <div className="space-y-6 pb-6">
        {/* Scores - affichage immédiat */}
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
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">
                    {formatAmount(workerData.dailyVelocity)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">par jour</p>
                </>
              )}
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
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">
                    {workerData.runway.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">mois d&apos;autonomie</p>
                </>
              )}
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
              <p className="text-sm text-muted-foreground mt-1">par mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholders pour les graphiques */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Chargement des statistiques...</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {formatAmount(workerData.dailyVelocity)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">par jour</p>
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
              {workerData.runway.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">mois d&apos;autonomie</p>
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
            <p className="text-sm text-muted-foreground mt-1">par mois</p>
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
                  data: workerData.predictions.map(p => ({ x: p.month, y: p.revenus }))
                },
                {
                  id: 'dépenses',
                  data: workerData.predictions.map(p => ({ x: p.month, y: p.dépenses }))
                },
                {
                  id: 'solde',
                  data: workerData.predictions.map(p => ({ x: p.month, y: p.solde }))
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
                  data: workerData.cashFlowData.map(d => ({ x: d.day, y: d.balance }))
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
                data={workerData.expensesByIcon.map((item, index) => ({
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

      {/* Petites dépenses récurrentes */}
      {workerData.smallRecurringExpenses.length > 0 && (
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
      )}

      {/* Timeline des crédits */}
      {workerData.creditTimeline.length > 0 && (
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
      )}
    </div>
  );
};

export default memo(StatsPageWithWorker);
