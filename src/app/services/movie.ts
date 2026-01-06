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

export interface MovieEntry {
  id?: string;
  date?: string;          // ili samo mjesec/godina
  monthIndex?: number;   // za Movie of the Month
  title: string;
  description: string;
  review: string;
  favoriteScene: string;
  posterDataUrl?: string | null;
  rating?: number;        // 1–10
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private getUserMoviesCollection() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return collection(this.firestore, `users/${user.uid}/movies`);
  }

  // Backwards-compatible addEntry
  async addEntry(entry: Omit<MovieEntry, 'id'>): Promise<void> {
    const colRef = this.getUserMoviesCollection();
    await addDoc(colRef, entry);
  }

  // Save or update entry by monthIndex (used by MovieTracker)
  async saveEntry(entry: Omit<MovieEntry, 'id'>): Promise<void> {
    const colRef = this.getUserMoviesCollection();
    if (entry.monthIndex === undefined || entry.monthIndex === null) {
      await addDoc(colRef, entry);
      return;
    }
    const q = query(colRef, where('monthIndex', '==', entry.monthIndex));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(colRef, entry);
    } else {
      // update first matching doc
      const docRef = doc(colRef, snapshot.docs[0].id);
      await setDoc(docRef, entry);
    }
  }

  async getEntries(): Promise<MovieEntry[]> {
    const colRef = this.getUserMoviesCollection();
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MovieEntry, 'id'>),
    }));
  }

  async deleteEntryByMonth(monthIndex: number): Promise<void> {
    const colRef = this.getUserMoviesCollection();
    const q = query(colRef, where('monthIndex', '==', monthIndex));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      const docRef = doc(colRef, d.id);
      await deleteDoc(docRef);
    }
  }
}
