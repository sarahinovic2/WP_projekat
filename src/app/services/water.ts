import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface WaterEntry {
  id?: string;
  date: string;
  glasses: number;  // broj čaša
  note: string;
}

@Injectable({
  providedIn: 'root',
})
export class WaterService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private getUserWaterCollection() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return collection(this.firestore, `users/${user.uid}/waterEntries`);
  }

  async addEntry(entry: Omit<WaterEntry, 'id'>): Promise<void> {
    const colRef = this.getUserWaterCollection();
    await addDoc(colRef, entry);
  }

  // Add or update entry by date (used by UI)
  async addOrUpdateEntry(date: string, glasses: number): Promise<void> {
    const colRef = this.getUserWaterCollection();
    const q = query(colRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(colRef, { date, glasses, note: '' });
    } else {
      const docRef = doc(colRef, snapshot.docs[0].id);
      await setDoc(docRef, { date, glasses, note: '' });
    }
  }

  async getEntries(): Promise<WaterEntry[]> {
    const colRef = this.getUserWaterCollection();
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<WaterEntry, 'id'>),
    }));
  }

  async deleteEntry(id: string): Promise<void> {
    const colRef = this.getUserWaterCollection();
    const docRef = doc(colRef, id);
    await deleteDoc(docRef);
  }
}
