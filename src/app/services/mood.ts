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

export interface MoodEntry {
  id?: string;
  date: string;
  mood: number;   // 1–5 scale
  note: string;
}

@Injectable({
  providedIn: 'root',
})
export class MoodService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private getUserMoodCollection() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return collection(this.firestore, `users/${user.uid}/moodEntries`);
  }

  async addEntry(entry: Omit<MoodEntry, 'id'>): Promise<void> {
    const colRef = this.getUserMoodCollection();
    await addDoc(colRef, entry);
  }

  async getEntries(): Promise<MoodEntry[]> {
    const colRef = this.getUserMoodCollection();
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MoodEntry, 'id'>),
    }));
  }

  async deleteEntry(id: string): Promise<void> {
    const colRef = this.getUserMoodCollection();
    const docRef = doc(colRef, id);
    await deleteDoc(docRef);
  }
}
