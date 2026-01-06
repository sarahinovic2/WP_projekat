import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface FinanceEntry {
  id?: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
}

export type FinanceCategory = 'food' | 'transport' | 'goingOut' | 'gifts' | 'clothes' | 'pets' | 'special';

export interface FinanceTransaction {
  id: number;
  date: string;
  amount: number;
  category: FinanceCategory;
  description: string;
}

export interface MonthlyFinance {
  year: number;
  month: number;
  income: number;
  fixedExpenses: number;
  transactions: FinanceTransaction[];
  nextId: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private getUserFinanceCollection() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return collection(this.firestore, `users/${user.uid}/financeEntries`);
  }

  async addEntry(entry: Omit<FinanceEntry, 'id'>): Promise<void> {
    const colRef = this.getUserFinanceCollection();
    await addDoc(colRef, entry);
  }

  async getEntries(): Promise<FinanceEntry[]> {
    const colRef = this.getUserFinanceCollection();
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FinanceEntry, 'id'>),
    }));
  }

  async deleteEntry(id: string): Promise<void> {
    const colRef = this.getUserFinanceCollection();
    const docRef = doc(colRef, id);
    await deleteDoc(docRef);
  }

  // Monthly finance helpers used by the UI
  private monthlyDocRef(year: number, month: number) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return doc(this.firestore, `users/${user.uid}/monthlyFinances/${year}-${month}`);
  }

  async loadMonth(year: number, month: number): Promise<MonthlyFinance | null> {
    const dRef = this.monthlyDocRef(year, month);
    const snap = await getDoc(dRef);
    if (!snap.exists()) return null;
    return snap.data() as MonthlyFinance;
  }

  async saveMonth(model: MonthlyFinance): Promise<void> {
    const dRef = this.monthlyDocRef(model.year, model.month);
    await setDoc(dRef, model);
  }
}
