import { Component, Inject, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, MovieEntry } from '../../../services/movie';

@Component({
  selector: 'app-movie-tracker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './movie-tracker.html',
  styleUrls: ['./movie-tracker.css'],
})
export class MovieTrackerComponent implements OnInit {
  private movieService = inject(MovieService);

  months = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  entries: MovieEntry[] = [];

  selectedMonthIndex = 0;
  form: MovieEntry = this.emptyEntry(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadFromFirestore();
      const existing = this.entries.find(e => e.monthIndex === this.selectedMonthIndex);
      if (existing) this.form = { ...existing };
    }
  }

  private emptyEntry(monthIndex: number): MovieEntry {
    return {
      monthIndex,
      title: '',
      description: '',
      review: '',
      favoriteScene: '',
      posterDataUrl: null,
    };
  }

  onMonthChange(index: number): void {
    this.selectedMonthIndex = index;
    const existing = this.entries.find(e => e.monthIndex === index);
    this.form = existing ? { ...existing } : this.emptyEntry(index);
  }

  getEntry(index: number): MovieEntry | undefined {
    return this.entries.find(e => e.monthIndex === index);
  }

  onPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.form.posterDataUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async saveEntry(): Promise<void> {
    try {
      this.form.monthIndex = this.selectedMonthIndex;
      await this.movieService.saveEntry({
        monthIndex: this.form.monthIndex,
        title: this.form.title,
        description: this.form.description,
        review: this.form.review,
        favoriteScene: this.form.favoriteScene,
        posterDataUrl: this.form.posterDataUrl,
      });
      await this.loadFromFirestore();
      alert('Movie of the Month spremljen!');
    } catch (e) {
      console.error(e);
      alert('Greška pri spremanju filma.');
    }
  }

  async clearEntry(): Promise<void> {
    if (!confirm('Obrisati podatke za ovaj mjesec?')) return;
    try {
      await this.movieService.deleteEntryByMonth(this.selectedMonthIndex);
      this.form = this.emptyEntry(this.selectedMonthIndex);
      await this.loadFromFirestore();
    } catch (e) {
      console.error(e);
      alert('Greška pri brisanju filma.');
    }
  }

  private async loadFromFirestore(): Promise<void> {
    try {
      this.entries = await this.movieService.getEntries();
    } catch (e) {
      console.error(e);
      this.entries = [];
    }
  }
}
