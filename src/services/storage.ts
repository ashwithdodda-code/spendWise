import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { Transaction, Budget, UserProfile } from '../types';
import { getDb, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { DEMO_PROFILES } from '../utils/sampleData';

const USER_PREFIX = 'spendwise_user_';
const TX_PREFIX = 'spendwise_tx_';
const BUDGET_PREFIX = 'spendwise_budget_';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        const docRef = doc(db, 'users', userId);
        const snap = await getDocs(query(collection(db, 'users'), where('userId', '==', userId)));
        if (!snap.empty) {
          return snap.docs[0].data() as UserProfile;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${userId}`);
      }
    }
  }

  // Local user-scoped storage
  const stored = localStorage.getItem(`${USER_PREFIX}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  // Check demo profiles
  const demo = DEMO_PROFILES.find(d => d.profile.userId === userId);
  if (demo) {
    localStorage.setItem(`${USER_PREFIX}${userId}`, JSON.stringify(demo.profile));
    return demo.profile;
  }

  return null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  localStorage.setItem(`${USER_PREFIX}${profile.userId}`, JSON.stringify(profile));

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'users', profile.userId), {
          ...profile,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${profile.userId}`);
      }
    }
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        const q = query(collection(db, 'transactions'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: Transaction[] = [];
        snap.forEach(d => {
          list.push(d.data() as Transaction);
        });
        return list.sort((a, b) => b.date.localeCompare(a.date));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      }
    }
  }

  // Local storage scoped strictly to userId
  const stored = localStorage.getItem(`${TX_PREFIX}${userId}`);
  if (stored) {
    try {
      const list: Transaction[] = JSON.parse(stored);
      return list.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }

  // Fallback demo initialization if user is demo
  const demo = DEMO_PROFILES.find(d => d.profile.userId === userId);
  if (demo) {
    localStorage.setItem(`${TX_PREFIX}${userId}`, JSON.stringify(demo.transactions));
    return [...demo.transactions].sort((a, b) => b.date.localeCompare(a.date));
  }

  return [];
}

export async function saveTransaction(userId: string, tx: Transaction): Promise<void> {
  const all = await getUserTransactions(userId);
  const existingIdx = all.findIndex(t => t.id === tx.id);
  let updatedList: Transaction[];

  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = tx;
  } else {
    updatedList = [tx, ...all];
  }

  localStorage.setItem(`${TX_PREFIX}${userId}`, JSON.stringify(updatedList));

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'transactions', tx.id), {
          ...tx,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`);
      }
    }
  }
}

export async function deleteTransaction(userId: string, txId: string): Promise<void> {
  const all = await getUserTransactions(userId);
  const updated = all.filter(t => t.id !== txId);
  localStorage.setItem(`${TX_PREFIX}${userId}`, JSON.stringify(updated));

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        await deleteDoc(doc(db, 'transactions', txId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `transactions/${txId}`);
      }
    }
  }
}

export async function getUserBudgets(userId: string): Promise<Budget[]> {
  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        const q = query(collection(db, 'budgets'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: Budget[] = [];
        snap.forEach(d => {
          list.push(d.data() as Budget);
        });
        return list;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'budgets');
      }
    }
  }

  const stored = localStorage.getItem(`${BUDGET_PREFIX}${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  const demo = DEMO_PROFILES.find(d => d.profile.userId === userId);
  if (demo) {
    localStorage.setItem(`${BUDGET_PREFIX}${userId}`, JSON.stringify(demo.budgets));
    return [...demo.budgets];
  }

  return [];
}

export async function saveBudget(userId: string, budget: Budget): Promise<void> {
  const all = await getUserBudgets(userId);
  const existingIdx = all.findIndex(b => b.id === budget.id || (b.category === budget.category && b.month === budget.month));
  let updatedList: Budget[];

  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = budget;
  } else {
    updatedList = [...all, budget];
  }

  localStorage.setItem(`${BUDGET_PREFIX}${userId}`, JSON.stringify(updatedList));

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'budgets', budget.id), {
          ...budget,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `budgets/${budget.id}`);
      }
    }
  }
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  const all = await getUserBudgets(userId);
  const updated = all.filter(b => b.id !== budgetId);
  localStorage.setItem(`${BUDGET_PREFIX}${userId}`, JSON.stringify(updated));

  if (isFirebaseConfigured()) {
    const db = getDb();
    if (db) {
      try {
        await deleteDoc(doc(db, 'budgets', budgetId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `budgets/${budgetId}`);
      }
    }
  }
}

export function resetDemoData(userId: string): void {
  const demo = DEMO_PROFILES.find(d => d.profile.userId === userId);
  if (demo) {
    localStorage.setItem(`${TX_PREFIX}${userId}`, JSON.stringify(demo.transactions));
    localStorage.setItem(`${BUDGET_PREFIX}${userId}`, JSON.stringify(demo.budgets));
    localStorage.setItem(`${USER_PREFIX}${userId}`, JSON.stringify(demo.profile));
  }
}
