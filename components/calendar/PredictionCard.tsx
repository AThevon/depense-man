import { Clock } from 'lucide-react';

interface PredictionCardProps {
  prediction: {
    startDate: Date;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  isCurrentMonth: boolean;
  variant: 'desktop' | 'mobile';
  formatAmount: (amount: number) => string;
}

export const PredictionCard = ({ prediction, isCurrentMonth, variant, formatAmount }: PredictionCardProps) => {
  const baseClasses = isCurrentMonth
    ? 'bg-gradient-to-r from-card via-muted/30 to-card'
    : 'bg-muted/50';

  const style = isCurrentMonth ? {
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, oklch(from var(--muted) l c h / 0.3) 8px, oklch(from var(--muted) l c h / 0.3) 12px)',
    backgroundSize: '24px 24px'
  } : {};

  const balanceColor = prediction.balance > 0
    ? 'text-success'
    : prediction.balance < 0
    ? 'text-destructive'
    : 'text-muted-foreground';

  if (variant === 'desktop') {
    return (
      <div
        className={`p-3 rounded-lg text-center relative ${baseClasses}`}
        style={style}
      >
        {isCurrentMonth && (
          <Clock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
        )}
        <div className="font-medium text-foreground text-sm">
          {prediction.startDate.toLocaleDateString('fr-FR', { month: 'short' })}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatAmount(prediction.totalIncome)} - {formatAmount(prediction.totalExpense)}
        </div>
        <div className={`font-bold text-sm ${balanceColor}`}>
          {formatAmount(prediction.balance)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg relative ${baseClasses}`}
      style={style}
    >
      {isCurrentMonth && (
        <Clock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
      )}
      <div className="flex-1">
        <div className="font-medium text-foreground text-sm">
          {prediction.startDate.toLocaleDateString('fr-FR', { month: 'short' })}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatAmount(prediction.totalIncome)} - {formatAmount(prediction.totalExpense)}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold text-sm ${balanceColor}`}>
          {formatAmount(prediction.balance)}
        </div>
      </div>
    </div>
  );
};