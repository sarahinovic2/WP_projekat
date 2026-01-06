import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService, WaterEntry } from '../../../services/water';

@Component({
  selector: 'app-water-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-tracker.html',
  styleUrls: ['./water-tracker.css'],
})
export class WaterTrackerComponent implements OnInit {
  private waterService = inject(WaterService);

  readonly glassesPerDayTarget = 10;  // 10 x 0.2L = 2L
  readonly maxGlassesPerDay = 20;     // do 4L

  // u memoriji i dalje držimo mapu date -> glasses, ali je punimo iz Firestore
  records: { [date: string]: number } = {};

  today = this.toDateString(new Date());
  selectedDate = this.today;

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth(); // 0–11

  loading = false;

  async ngOnInit() {
    await this.loadFromFirestore();
  }

  toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  get glassesForSelectedDate(): number {
    return this.records[this.selectedDate] ?? 0;
  }

  get litersForSelectedDate(): number {
    return +(this.glassesForSelectedDate * 0.2).toFixed(1);
  }

  /** klik na čašu 1..20 */
  async setGlasses(count: number): Promise<void> {
    if (count < 0) count = 0;
    if (count > this.maxGlassesPerDay) count = this.maxGlassesPerDay;

    this.loading = true;
    try {
      // spremi u lokalnu mapu
      this.records[this.selectedDate] = count;
      // pošalji u Firestore
      await this.waterService.addOrUpdateEntry(this.selectedDate, count);
    } catch (e) {
      console.error(e);
      alert('Greška pri spremanju unosa vode.');
    } finally {
      this.loading = false;
    }
  }

  /** je li čaša popunjena (za prikaz boje) */
  isGlassFilled(index: number): boolean {
    return index <= this.glassesForSelectedDate;
  }

  isSuccess(date: string): boolean {
    return (this.records[date] ?? 0) >= this.glassesPerDayTarget;
  }

  // --- kalendar ---

  get monthName(): string {
    return new Date(this.selectedYear, this.selectedMonth, 1)
      .toLocaleString('default', { month: 'long' });
  }

  get calendarDays(): (Date | null)[] {
    const first = new Date(this.selectedYear, this.selectedMonth, 1);
    const last = new Date(this.selectedYear, this.selectedMonth + 1, 0);
    const result: (Date | null)[] = [];

    const startWeekday = first.getDay() === 0 ? 7 : first.getDay(); // 1-7, pon=1
    for (let i = 1; i < startWeekday; i++) result.push(null);

    for (let d = 1; d <= last.getDate(); d++) {
      result.push(new Date(this.selectedYear, this.selectedMonth, d));
    }
    return result;
  }

  changeMonth(delta: number): void {
    const newMonthDate = new Date(this.selectedYear, this.selectedMonth + delta, 1);
    this.selectedYear = newMonthDate.getFullYear();
    this.selectedMonth = newMonthDate.getMonth();
  }

  selectDateFromCalendar(d: Date): void {
    const iso = this.toDateString(d);
    this.selectedDate = iso;
  }

  // --- učitavanje iz Firestore ---

  private async loadFromFirestore(): Promise<void> {
    this.loading = true;
    try {
      const entries = await this.waterService.getEntries();
      const map: { [date: string]: number } = {};
      for (const e of entries) {
        // ako isti dan ima više dokumenata, uzmi zadnji (ili najveći broj čaša)
        map[e.date] = Math.max(map[e.date] ?? 0, e.glasses);
      }
      this.records = map;
    } catch (e) {
      console.error(e);
      this.records = {};
    } finally {
      this.loading = false;
    }
  }
}
