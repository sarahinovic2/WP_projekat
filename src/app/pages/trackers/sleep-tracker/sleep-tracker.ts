import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SleepService, SleepEntry } from '../../../services/sleep';

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleep-tracker.html',
  styleUrls: ['./sleep-tracker.css'],
})
export class SleepTrackerComponent implements OnInit {
  private sleepService = inject(SleepService);

  entries: SleepEntry[] = [];

  // forma
  date = this.today();
  hours = 8;
  rating = 3;
  note = '';

  loading = false;

  ngOnInit(): void {
    this.loadEntries();
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

  async addEntry(): Promise<void> {
    if (!this.date || this.hours <= 0) return;
    this.loading = true;
    try {
      await this.sleepService.addEntry({
        date: this.date,
        hours: this.hours,
        rating: this.rating,
        note: this.note.trim(),
      });
      await this.loadEntries();
      this.hours = 8;
      this.rating = 3;
      this.note = '';
    } catch (e) {
      console.error(e);
      alert('Greška pri spremanju zapisa.');
    } finally {
      this.loading = false;
    }
  }

  async deleteEntry(id?: string): Promise<void> {
    if (!id) return;
    if (!confirm('Obrisati ovaj zapis o spavanju?')) return;
    this.loading = true;
    try {
      await this.sleepService.deleteEntry(id);
      await this.loadEntries();
    } catch (e) {
      console.error(e);
      alert('Greška pri brisanju zapisa.');
    } finally {
      this.loading = false;
    }
  }

  private async loadEntries(): Promise<void> {
    this.loading = true;
    try {
      this.entries = await this.sleepService.getEntries();
    } catch (e) {
      console.error(e);
      this.entries = [];
    } finally {
      this.loading = false;
    }
  }
}
