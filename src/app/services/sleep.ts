import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface SleepEntry {
  id?: string;       // Firestore id
  date: string;
  hours: number;
  rating: number;
  note: string;
}

@Injectable({
  providedIn: 'root',
})
export class SleepService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private getUserSleepCollection() {
    const user = this.auth.currentUser;
    console.log('AUTH USER U SLEEP SERVICE:', user);
    if (!user) {
      throw new Error('User not logged in');
    }
    return collection(this.firestore, `users/${user.uid}/sleepEntries`);
  }

  async addEntry(entry: Omit<SleepEntry, 'id'>): Promise<void> {
    const colRef = this.getUserSleepCollection();
    await addDoc(colRef, entry);
  }

  async getEntries(): Promise<SleepEntry[]> {
    const colRef = this.getUserSleepCollection();
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SleepEntry, 'id'>),
    }));
  }

  async deleteEntry(id: string): Promise<void> {
    const colRef = this.getUserSleepCollection();
    const docRef = doc(colRef, id);
    await deleteDoc(docRef);
  }
}
