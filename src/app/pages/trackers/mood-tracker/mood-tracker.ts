import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MoodEntry {
  id: number;
  date: string;      // yyyy-mm-dd
  mood: number;      // 1–5
  note: string;
}

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-tracker.html',
  styleUrls: ['./mood-tracker.css']
})
export class MoodTrackerComponent {

  moods = [
    { value: 1, label: '😢', text: 'Vrlo loše', colorClass: 'mood-very-bad' },
    { value: 2, label: '😕', text: 'Loše',      colorClass: 'mood-bad' },
    { value: 3, label: '😐', text: 'Ok',        colorClass: 'mood-ok' },
    { value: 4, label: '🙂', text: 'Dobro',     colorClass: 'mood-good' },
    { value: 5, label: '😄', text: 'Odlično',   colorClass: 'mood-great' }
  ];

  entries: MoodEntry[] = [];
  nextId = 1;

  date = this.today();
  selectedMood = 3;
  note = '';

  constructor() {
    this.loadFromStorage();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  selectMood(value: number): void {
    this.selectedMood = value;
  }

  addEntry(): void {
    if (!this.date) return;
    const entry: MoodEntry = {
      id: this.nextId++,
      date: this.date,
      mood: this.selectedMood,
      note: this.note.trim()
    };
    this.entries.unshift(entry);
    this.saveToStorage();

    this.note = '';
  }

  deleteEntry(id: number): void {
    if (!confirm('Obrisati ovaj zapis raspoloženja?')) return;
    this.entries = this.entries.filter(e => e.id !== id);
    this.saveToStorage();
  }

  getMoodMeta(mood: number) {
    return this.moods.find(m => m.value === mood) || this.moods[2];
  }

  private saveToStorage(): void {
    localStorage.setItem('moodEntries', JSON.stringify({
      nextId: this.nextId,
      entries: this.entries
    }));
  }

  private loadFromStorage(): void {
    const raw = localStorage.getItem('moodEntries');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { nextId: number; entries: MoodEntry[] };
      this.entries = data.entries || [];
      this.nextId = data.nextId || (this.entries.length + 1);
    } catch {
      this.entries = [];
      this.nextId = 1;
    }
  }
}
