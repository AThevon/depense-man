'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpensesStore } from '@/lib/store/expenses';
import { MonthlyItem, MonthlyExpense, MonthlyIncome } from '@/lib/types';
import { calculateCreditInfoAtDate } from '@/lib/creditCalculations';
import { motion } from 'motion/react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleExpenseForm } from '@/components/forms/SimpleExpenseForm';
import { CreditExpenseForm } from '@/components/forms/CreditExpenseForm';
import { SimpleIncomeForm } from '@/components/forms/SimpleIncomeForm';
import {
  ArrowLeft,
  Calendar,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Trash2,
  Edit,
  Clock,
  DollarSign,
  Percent,
  Info,
  AlertCircle,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ExpenseDetailClientProps {
  expenseId: string;
}

export const ExpenseDetailClient = ({ expenseId }: ExpenseDetailClientProps) => {
  const router = useRouter();
  const { items, deleteExpense, isLoading } = useExpensesStore();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Trouver l'item dans le store au lieu de faire un fetch
  const item = items.find(i => i.id === expenseId) || null;

  useEffect(() => {
    // Si les items sont chargés mais l'item n'existe pas, rediriger
    if (!isLoading && !item) {
      router.push('/');
    }
  }, [item, isLoading, router]);

  const handleDelete = async () => {
    if (!item) return;

    setDeleting(true);
    try {
      await deleteExpense(item.id);
      router.push('/');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erreur lors de la suppression');
      setDeleting(false);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  if (isLoading || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isExpense = item.type === 'expense';
  const expenseItem = isExpense ? (item as MonthlyExpense) : null;
  const incomeItem = !isExpense ? (item as MonthlyIncome) : null;
  const isCredit = expenseItem?.isCredit || false;

  let creditInfo = null;
  if (isCredit && expenseItem) {
    creditInfo = calculateCreditInfoAtDate(expenseItem);
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      {/* Header avec actions */}
      <motion.div
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Hero Card - Icône et Titre principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-2">
            <div
              className={`h-32 ${
                isExpense
                  ? 'bg-gradient-to-br from-destructive/20 via-destructive/10 to-background'
                  : 'bg-gradient-to-br from-success/20 via-success/10 to-background'
              } relative`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <CardContent className="relative -mt-16 pb-8">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icône géante */}
                <motion.div
                  className={`rounded-3xl p-6 ${
                    isExpense ? 'bg-destructive/10' : 'bg-success/10'
                  } border-4 border-background shadow-2xl`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                >
                  <Icon name={item.icon} className="h-16 w-16" />
                </motion.div>

                {/* Nom */}
                <motion.h1
                  className="text-4xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {item.name}
                </motion.h1>

                {/* Badges */}
                <motion.div
                  className="flex gap-2 flex-wrap justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge variant={isExpense ? 'destructive' : 'default'} className="text-sm px-3 py-1">
                    {isExpense ? (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Dépense
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Revenu
                      </>
                    )}
                  </Badge>
                  {isCredit && (
                    <Badge variant="outline" className="text-sm px-3 py-1 border-primary">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Crédit
                    </Badge>
                  )}
                  {creditInfo?.isActive && (
                    <Badge className="text-sm px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-300">
                      Actif
                    </Badge>
                  )}
                </motion.div>

                {/* Montant principal */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <div className={`text-6xl font-black ${isExpense ? 'text-destructive' : 'text-success'}`}>
                    {isExpense ? '-' : '+'}{formatAmount(item.amount)}
                  </div>
                  {creditInfo?.monthlyAmount && (
                    <div className="text-sm text-muted-foreground">
                      Mensualité : {formatAmount(creditInfo.monthlyAmount)}
                    </div>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Informations principales */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date de prélèvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Le {item.dayOfMonth}</div>
              <div className="text-sm text-muted-foreground mt-1">de chaque mois</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Montant {isExpense ? 'dépensé' : 'perçu'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(item.amount)}</div>
              <div className="text-sm text-muted-foreground mt-1">par mois</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Informations crédit */}
        {isCredit && expenseItem && creditInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Détails du crédit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Durée totale
                    </div>
                    <div className="text-xl font-bold">{expenseItem.creditDuration} mois</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Mensualité
                    </div>
                    <div className="text-xl font-bold">{formatAmount(creditInfo.monthlyAmount)}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de début
                    </div>
                    <div className="text-lg font-semibold">
                      {formatDate(new Date(expenseItem.creditStartDate!))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de fin
                    </div>
                    <div className="text-lg font-semibold">
                      {formatDate(new Date(creditInfo.endDate))}
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold">
                      {creditInfo.paymentsMade} / {expenseItem.creditDuration} mois
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${creditInfo.progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="font-semibold text-foreground">
                      {creditInfo.progressPercentage.toFixed(1)}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Montant restant */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Montant total payé</span>
                    <span className="text-xl font-bold text-success">
                      {formatAmount(creditInfo.paymentsMade * creditInfo.monthlyAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-muted-foreground">Reste à payer</span>
                    <span className="text-xl font-bold text-destructive">
                      {formatAmount(creditInfo.remainingAmount)}
                    </span>
                  </div>
                </div>

                {!creditInfo.isActive && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      {creditInfo.paymentsMade === 0 ? (
                        <>
                          <div className="font-semibold">Crédit pas encore commencé</div>
                          <div className="text-muted-foreground">
                            Ce crédit débutera le {formatDate(new Date(expenseItem.creditStartDate!))}.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold">Crédit terminé</div>
                          <div className="text-muted-foreground">
                            Ce crédit a été entièrement remboursé et n'est plus actif.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Catégorie et notes (si on ajoute ça plus tard) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Informations complémentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold capitalize">{item.type === 'expense' ? 'Dépense' : 'Revenu'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Icône</span>
                <div className="flex items-center gap-2">
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span className="font-mono text-sm">{item.icon}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modale de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div
            className="bg-card rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl border border-border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Confirmer la suppression</h3>
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-foreground">&quot;{item.name}&quot;</span> ?
                Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modales d'édition */}
      {showEditForm && item.type === 'income' && (
        <SimpleIncomeForm
          item={item as MonthlyIncome}
          onSuccess={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
        />
      )}
      {showEditForm && item.type === 'expense' && !(item as MonthlyExpense).isCredit && (
        <SimpleExpenseForm
          item={item as MonthlyExpense}
          onSuccess={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
        />
      )}
      {showEditForm && item.type === 'expense' && (item as MonthlyExpense).isCredit && (
        <CreditExpenseForm
          item={item as MonthlyExpense}
          onSuccess={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};
