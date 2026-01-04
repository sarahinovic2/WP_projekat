import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FinanceCategory =
  | 'food'
  | 'transport'
  | 'goingOut'
  | 'gifts'
  | 'clothes'
  | 'pets'
  | 'special';

interface FinanceTransaction {
  id: number;
  date: string;          // yyyy-mm-dd
  amount: number;
  category: FinanceCategory;
  description: string;
}

interface MonthlyFinance {
  year: number;
  month: number;         // 0–11
  income: number;
  fixedExpenses: number;
  transactions: FinanceTransaction[];
  nextId: number;
}

@Component({
  selector: 'app-finance-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-tracker.html',
  styleUrls: ['./finance-tracker.css']
})
export class FinanceTrackerComponent {

  categories: { value: FinanceCategory; label: string }[] = [
    { value: 'food',      label: 'Hrana' },
    { value: 'transport', label: 'Prevoz' },
    { value: 'goingOut',  label: 'Going out' },
    { value: 'gifts',     label: 'Pokloni' },
    { value: 'clothes',   label: 'Odjeća' },
    { value: 'pets',      label: 'Ljubimci' },
    { value: 'special',   label: 'Specijalni trošak' }
  ];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth(); // 0–11

  // trenutno učitani mjesec
  model: MonthlyFinance = this.emptyMonth(this.currentYear, this.currentMonth);

  // forma za pojedinačni trošak
  txDate = this.today();
  txAmount: number | null = null;
  txCategory: FinanceCategory = 'food';
  txDescription = '';

  constructor() {
    this.loadCurrentMonth();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private monthKey(year: number, month: number): string {
    // npr. "2026-01"
    const m = (month + 1).toString().padStart(2, '0');
    return `${year}-${m}`;
  }

  private emptyMonth(year: number, month: number): MonthlyFinance {
    return {
      year,
      month,
      income: 0,
      fixedExpenses: 0,
      transactions: [],
      nextId: 1
    };
  }

  changeMonth(delta: number): void {
    const d = new Date(this.currentYear, this.currentMonth + delta, 1);
    this.currentYear = d.getFullYear();
    this.currentMonth = d.getMonth();
    this.loadCurrentMonth();
  }

  loadCurrentMonth(): void {
    const key = this.monthKey(this.currentYear, this.currentMonth);
    const raw = localStorage.getItem('finance-' + key);
    if (!raw) {
      this.model = this.emptyMonth(this.currentYear, this.currentMonth);
      return;
    }
    try {
      this.model = JSON.parse(raw) as MonthlyFinance;
    } catch {
      this.model = this.emptyMonth(this.currentYear, this.currentMonth);
    }
  }

  saveMonth(): void {
    const key = this.monthKey(this.model.year, this.model.month);
    localStorage.setItem('finance-' + key, JSON.stringify(this.model));
  }

  // --- prihodi i fiksni troškovi ---

  onIncomeChange(): void {
    this.saveMonth();
  }

  onFixedChange(): void {
    this.saveMonth();
  }

  // --- transakcije ---

  addTransaction(): void {
    if (!this.txDate || !this.txAmount || this.txAmount <= 0) return;

    const tx: FinanceTransaction = {
      id: this.model.nextId++,
      date: this.txDate,
      amount: this.txAmount,
      category: this.txCategory,
      description: this.txDescription.trim()
    };

    this.model.transactions.unshift(tx);
    this.saveMonth();

    // reset forme
    this.txAmount = null;
    this.txDescription = '';
  }

  deleteTransaction(id: number): void {
    if (!confirm('Obrisati ovaj trošak?')) return;
    this.model.transactions = this.model.transactions.filter(t => t.id !== id);
    this.saveMonth();
  }

  // --- analitika ---

  get totalVariable(): number {
    return this.model.transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.model.fixedExpenses + this.totalVariable;
  }

  get leftover(): number {
    return this.model.income - this.totalExpenses;
  }

  // suma po kategoriji
  get sumByCategory(): Record<FinanceCategory, number> {
    const sums: Record<FinanceCategory, number> = {
      food: 0,
      transport: 0,
      goingOut: 0,
      gifts: 0,
      clothes: 0,
      pets: 0,
      special: 0
    };
    for (const t of this.model.transactions) {
      sums[t.category] += t.amount;
    }
    return sums;
  }

  // procenti po kategoriji (od varijabilnih troškova)
  get percentByCategory(): Record<FinanceCategory, number> {
    const total = this.totalVariable;
    const perc: Record<FinanceCategory, number> = {
      food: 0,
      transport: 0,
      goingOut: 0,
      gifts: 0,
      clothes: 0,
      pets: 0,
      special: 0
    };
    if (total <= 0) return perc;
    const sums = this.sumByCategory;
    (Object.keys(sums) as FinanceCategory[]).forEach(cat => {
      perc[cat] = +( (sums[cat] / total) * 100 ).toFixed(1);
    });
    return perc;
  }

  getMonthLabel(): string {
    return new Date(this.currentYear, this.currentMonth, 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  categoryLabel(cat: FinanceCategory): string {
    return this.categories.find(c => c.value === cat)?.label || cat;
  }
}
