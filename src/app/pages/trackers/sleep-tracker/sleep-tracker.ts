import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SleepEntry {
  id: number;
  date: string;       // ISO string yyyy-mm-dd
  hours: number;      // broj sati
  rating: number;     // 1–5
  note: string;
}

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleep-tracker.html',
  styleUrls: ['./sleep-tracker.css']
})
export class SleepTrackerComponent {

  entries: SleepEntry[] = [];
  nextId = 1;

  // forma
  date = this.today();
  hours = 8;
  rating = 3;
  note = '';

  private isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  constructor() {
    if (this.isBrowser) this.loadFromStorage();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  getMoodLabel(rating: number): string {
    if (rating <= 2) return 'Loše';
    if (rating === 3) return 'Ok';
    if (rating === 4) return 'Dobro';
    return 'Odlično';
  }

  addEntry(): void {
    if (!this.date || this.hours <= 0) return;

    const entry: SleepEntry = {
      id: this.nextId++,
      date: this.date,
      hours: this.hours,
      rating: this.rating,
      note: this.note.trim()
    };

    this.entries.unshift(entry);  // novi zapis na vrh
    this.saveToStorage();

    // reset forme (datum ostaje današnji)
    this.hours = 8;
    this.rating = 3;
    this.note = '';
  }

  deleteEntry(id: number): void {
    if (!confirm('Obrisati ovaj zapis o spavanju?')) return;
    this.entries = this.entries.filter(e => e.id !== id);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('sleepEntries', JSON.stringify({
      nextId: this.nextId,
      entries: this.entries
    }));
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem('sleepEntries');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { nextId: number; entries: SleepEntry[] };
      this.entries = data.entries || [];
      this.nextId = data.nextId || (this.entries.length + 1);
    } catch {
      this.entries = [];
      this.nextId = 1;
    }
  }
}
