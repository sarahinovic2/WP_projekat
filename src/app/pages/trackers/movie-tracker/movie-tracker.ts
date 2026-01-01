import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MovieEntry {
  monthIndex: number;      // 0–11
  title: string;
  description: string;
  review: string;
  favoriteScene: string;
  posterDataUrl: string | null;  // base64 slika postera
}

@Component({
  selector: 'app-movie-tracker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './movie-tracker.html',
  styleUrls: ['./movie-tracker.css']
})
export class MovieTrackerComponent implements OnInit {

  months = [
    'Januar','Februar','Mart','April','Maj','Juni',
    'Juli','August','Septembar','Oktobar','Novembar','Decembar'
  ];

  entries: MovieEntry[] = [];

  selectedMonthIndex = 0;
  form: MovieEntry = this.emptyEntry(0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
      // ako već postoji zapis za trenutni mjesec, učitaj ga
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
      posterDataUrl: null
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

  saveEntry(): void {
    // ukloni stari zapis za taj mjesec
    this.entries = this.entries.filter(e => e.monthIndex !== this.selectedMonthIndex);
    // dodaj novi
    this.entries.push({ ...this.form });
    this.saveToStorage();
    alert('Movie of the Month spremljen!');
  }

  clearEntry(): void {
    if (!confirm('Obrisati podatke za ovaj mjesec?')) return;
    this.entries = this.entries.filter(e => e.monthIndex !== this.selectedMonthIndex);
    this.form = this.emptyEntry(this.selectedMonthIndex);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('movieOfTheMonth', JSON.stringify(this.entries));
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = localStorage.getItem('movieOfTheMonth');
    if (!raw) return;
    try {
      this.entries = JSON.parse(raw) as MovieEntry[];
    } catch {
      this.entries = [];
    }
  }
}
