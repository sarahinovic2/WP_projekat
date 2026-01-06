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

export interface PlannerEntry {
  id?: string;
  date: string;
  title: string;
  description: string;
  done: boolean;
}

export interface PlannerTask {
  id: number;
  text: string;
  done: boolean;
}

export interface PlannerDay {
  date: string;
  weather: string;
  todos: PlannerTask[];
  goals: string[];
  schedule: Record<string, string>;
  notes: string;
  tomorrow: string;
  nextTaskId: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlannerService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private getUserPlannerCollection() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return collection(this.firestore, `users/${user.uid}/plannerEntries`);
  }

  async addEntry(entry: Omit<PlannerEntry, 'id'>): Promise<void> {
    const colRef = this.getUserPlannerCollection();
    await addDoc(colRef, entry);
  }

  async getEntries(): Promise<PlannerEntry[]> {
    const colRef = this.getUserPlannerCollection();
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PlannerEntry, 'id'>),
    }));
  }

  async deleteEntry(id: string): Promise<void> {
    const colRef = this.getUserPlannerCollection();
    const docRef = doc(colRef, id);
    await deleteDoc(docRef);
  }

  private dayDocRef(date: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return doc(this.firestore, `users/${user.uid}/plannerDays/${date}`);
  }

  async loadDay(date: string): Promise<PlannerDay | null> {
    const dRef = this.dayDocRef(date);
    const snap = await getDoc(dRef);
    if (!snap.exists()) return null;
    return snap.data() as PlannerDay;
  }

  async saveDay(day: PlannerDay): Promise<void> {
    const dRef = this.dayDocRef(day.date);
    await setDoc(dRef, day);
  }
}
