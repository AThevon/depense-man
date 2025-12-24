'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/auth/session';
import { Timestamp } from 'firebase-admin/firestore';

// Types pour les Server Actions
export type ExpenseFormData = {
  name: string;
  amount: number;
  dayOfMonth: number;
  icon: string;
  isCredit?: boolean;
  totalCreditAmount?: number;
  creditStartDate?: Date;
  creditDuration?: number;
};

export type IncomeFormData = {
  name: string;
  amount: number;
  dayOfMonth: number;
  icon: string;
};

export type ActionState = {
  error?: string;
  success?: boolean;
};

// ============================================================================
// EXPENSES
// ============================================================================

export async function addExpense(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Extraire et valider les données du formulaire
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dayOfMonth = parseInt(formData.get('dayOfMonth') as string);
    const icon = formData.get('icon') as string;
    const isCredit = formData.get('isCredit') === 'true';

    if (!name || !amount || !dayOfMonth || !icon) {
      return { error: 'Tous les champs sont requis' };
    }

    if (amount <= 0) {
      return { error: 'Le montant doit être positif' };
    }

    if (dayOfMonth < 1 || dayOfMonth > 31) {
      return { error: 'Le jour doit être entre 1 et 31' };
    }

    // 3. Préparer les données pour Firestore
    const expenseData: Record<string, unknown> = {
      userId: session.userId,
      name,
      amount,
      dayOfMonth,
      icon,
      type: 'expense',
      isCredit: isCredit || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // 4. Si c'est un crédit, ajouter les champs supplémentaires
    if (isCredit) {
      const totalCreditAmount = parseFloat(formData.get('totalCreditAmount') as string);
      const creditStartDate = formData.get('creditStartDate') as string;
      const creditDuration = parseInt(formData.get('creditDuration') as string);

      if (!totalCreditAmount || !creditStartDate || !creditDuration) {
        return { error: 'Tous les champs crédit sont requis' };
      }

      expenseData.totalCreditAmount = totalCreditAmount;
      expenseData.creditStartDate = Timestamp.fromDate(new Date(creditStartDate));
      expenseData.creditDuration = creditDuration;
    }

    // 5. Ajouter à Firestore
    await adminDb.collection('monthly_items').add(expenseData);

    // 6. Revalider le cache Next.js pour mettre à jour la page
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error adding expense:', error);
    return { error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout' };
  }
}

export async function updateExpense(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Récupérer l'ID de l'expense à modifier
    const id = formData.get('id') as string;
    if (!id) {
      return { error: 'ID manquant' };
    }

    // 3. Vérifier que l'expense appartient à l'utilisateur
    const expenseRef = adminDb.collection('monthly_items').doc(id);
    const expenseDoc = await expenseRef.get();

    if (!expenseDoc.exists) {
      return { error: 'Dépense introuvable' };
    }

    const expenseData = expenseDoc.data();
    if (expenseData?.userId !== session.userId) {
      return { error: 'Non autorisé' };
    }

    // 4. Extraire et valider les nouvelles données
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dayOfMonth = parseInt(formData.get('dayOfMonth') as string);
    const icon = formData.get('icon') as string;
    const isCredit = formData.get('isCredit') === 'true';

    if (!name || !amount || !dayOfMonth || !icon) {
      return { error: 'Tous les champs sont requis' };
    }

    // 5. Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {
      name,
      amount,
      dayOfMonth,
      icon,
      isCredit: isCredit || false,
      updatedAt: Timestamp.now(),
    };

    // 6. Gérer les champs crédit
    if (isCredit) {
      const totalCreditAmount = parseFloat(formData.get('totalCreditAmount') as string);
      const creditStartDate = formData.get('creditStartDate') as string;
      const creditDuration = parseInt(formData.get('creditDuration') as string);

      if (!totalCreditAmount || !creditStartDate || !creditDuration) {
        return { error: 'Tous les champs crédit sont requis' };
      }

      updateData.totalCreditAmount = totalCreditAmount;
      updateData.creditStartDate = Timestamp.fromDate(new Date(creditStartDate));
      updateData.creditDuration = creditDuration;
    } else {
      // Si ce n'est plus un crédit, supprimer les champs crédit
      updateData.totalCreditAmount = null;
      updateData.creditStartDate = null;
      updateData.creditDuration = null;
    }

    // 7. Mettre à jour dans Firestore
    await expenseRef.update(updateData);

    // 8. Revalider le cache
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
  }
}

export async function deleteExpense(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Récupérer l'ID
    const id = formData.get('id') as string;
    if (!id) {
      return { error: 'ID manquant' };
    }

    // 3. Vérifier que l'expense appartient à l'utilisateur
    const expenseRef = adminDb.collection('monthly_items').doc(id);
    const expenseDoc = await expenseRef.get();

    if (!expenseDoc.exists) {
      return { error: 'Dépense introuvable' };
    }

    const expenseData = expenseDoc.data();
    if (expenseData?.userId !== session.userId) {
      return { error: 'Non autorisé' };
    }

    // 4. Supprimer de Firestore
    await expenseRef.delete();

    // 5. Revalider le cache
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
  }
}

// ============================================================================
// INCOME
// ============================================================================

export async function addIncome(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Extraire et valider les données
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dayOfMonth = parseInt(formData.get('dayOfMonth') as string);
    const icon = formData.get('icon') as string;

    if (!name || !amount || !dayOfMonth || !icon) {
      return { error: 'Tous les champs sont requis' };
    }

    if (amount <= 0) {
      return { error: 'Le montant doit être positif' };
    }

    if (dayOfMonth < 1 || dayOfMonth > 31) {
      return { error: 'Le jour doit être entre 1 et 31' };
    }

    // 3. Préparer les données
    const incomeData = {
      userId: session.userId,
      name,
      amount,
      dayOfMonth,
      icon,
      type: 'income',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // 4. Ajouter à Firestore
    await adminDb.collection('monthly_items').add(incomeData);

    // 5. Revalider le cache
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error adding income:', error);
    return { error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout' };
  }
}

export async function updateIncome(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Récupérer l'ID
    const id = formData.get('id') as string;
    if (!id) {
      return { error: 'ID manquant' };
    }

    // 3. Vérifier que l'income appartient à l'utilisateur
    const incomeRef = adminDb.collection('monthly_items').doc(id);
    const incomeDoc = await incomeRef.get();

    if (!incomeDoc.exists) {
      return { error: 'Revenu introuvable' };
    }

    const incomeData = incomeDoc.data();
    if (incomeData?.userId !== session.userId) {
      return { error: 'Non autorisé' };
    }

    // 4. Extraire et valider les nouvelles données
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dayOfMonth = parseInt(formData.get('dayOfMonth') as string);
    const icon = formData.get('icon') as string;

    if (!name || !amount || !dayOfMonth || !icon) {
      return { error: 'Tous les champs sont requis' };
    }

    // 5. Préparer les données de mise à jour
    const updateData = {
      name,
      amount,
      dayOfMonth,
      icon,
      updatedAt: Timestamp.now(),
    };

    // 6. Mettre à jour dans Firestore
    await incomeRef.update(updateData);

    // 7. Revalider le cache
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating income:', error);
    return { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' };
  }
}

export async function deleteIncome(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Récupérer l'ID
    const id = formData.get('id') as string;
    if (!id) {
      return { error: 'ID manquant' };
    }

    // 3. Vérifier que l'income appartient à l'utilisateur
    const incomeRef = adminDb.collection('monthly_items').doc(id);
    const incomeDoc = await incomeRef.get();

    if (!incomeDoc.exists) {
      return { error: 'Revenu introuvable' };
    }

    const incomeData = incomeDoc.data();
    if (incomeData?.userId !== session.userId) {
      return { error: 'Non autorisé' };
    }

    // 4. Supprimer de Firestore
    await incomeRef.delete();

    // 5. Revalider le cache
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting income:', error);
    return { error: error instanceof Error ? error.message : 'Erreur lors de la suppression' };
  }
}
