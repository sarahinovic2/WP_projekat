import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodService, MoodEntry } from '../../../services/mood';

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-tracker.html',
  styleUrls: ['./mood-tracker.css'],
})
export class MoodTrackerComponent implements OnInit {
  private moodService = inject(MoodService);

  moods = [
    { value: 1, label: '😢', text: 'Vrlo loše', colorClass: 'mood-very-bad' },
    { value: 2, label: '😕', text: 'Loše',      colorClass: 'mood-bad' },
    { value: 3, label: '😐', text: 'Ok',        colorClass: 'mood-ok' },
    { value: 4, label: '🙂', text: 'Dobro',     colorClass: 'mood-good' },
    { value: 5, label: '😄', text: 'Odlično',   colorClass: 'mood-great' },
  ];

  entries: MoodEntry[] = [];

  date = this.today();
  selectedMood = 3;
  note = '';

  loading = false;

  ngOnInit(): void {
    this.loadEntries();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  selectMood(value: number): void {
    this.selectedMood = value;
  }

  async addEntry(): Promise<void> {
    if (!this.date) return;
    this.loading = true;
    try {
      await this.moodService.addEntry({
        date: this.date,
        mood: this.selectedMood,
        note: this.note.trim(),
      });
      await this.loadEntries();
      this.note = '';
    } catch (e) {
      console.error(e);
      alert('Greška pri spremanju raspoloženja.');
    } finally {
      this.loading = false;
    }
  }

  async deleteEntry(id?: string): Promise<void> {
    if (!id) return;
    if (!confirm('Obrisati ovaj zapis raspoloženja?')) return;
    this.loading = true;
    try {
      await this.moodService.deleteEntry(id);
      await this.loadEntries();
    } catch (e) {
      console.error(e);
      alert('Greška pri brisanju zapisa.');
    } finally {
      this.loading = false;
    }
  }

  getMoodMeta(mood: number) {
    return this.moods.find(m => m.value === mood) || this.moods[2];
  }

  private async loadEntries(): Promise<void> {
    this.loading = true;
    try {
      this.entries = await this.moodService.getEntries();
    } catch (e) {
      console.error(e);
      this.entries = [];
    } finally {
      this.loading = false;
    }
  }
}
