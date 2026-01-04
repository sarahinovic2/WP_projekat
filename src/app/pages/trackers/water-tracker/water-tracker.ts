import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WaterRecords {
  [date: string]: number; // yyyy-mm-dd -> number of glasses
}

@Component({
  selector: 'app-water-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-tracker.html',
  styleUrls: ['./water-tracker.css']
})
export class WaterTrackerComponent {

  readonly glassesPerDayTarget = 10;   // 10 x 0.2L = 2L
  readonly maxGlassesPerDay = 20;      // do 4L

  records: WaterRecords = {};

  today = this.toDateString(new Date());
  selectedDate = this.today;

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth(); // 0–11

  private isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  constructor() {
    if (this.isBrowser) this.loadFromStorage();
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
  setGlasses(count: number): void {
    if (count < 0) count = 0;
    if (count > this.maxGlassesPerDay) count = this.maxGlassesPerDay;
    this.records[this.selectedDate] = count;
    this.saveToStorage();
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

  // --- storage ---

  private saveToStorage(): void {
    if (!this.isBrowser) return;
    localStorage.setItem('waterRecords', JSON.stringify(this.records));
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem('waterRecords');
    if (!raw) return;
    try {
      this.records = JSON.parse(raw) as WaterRecords;
    } catch {
      this.records = {};
    }
  }
}
