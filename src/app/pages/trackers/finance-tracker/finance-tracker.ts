import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FinanceCategory,
  FinanceTransaction,
  MonthlyFinance,
  FinanceService,
} from '../../../services/finance';

@Component({
  selector: 'app-finance-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-tracker.html',
  styleUrls: ['./finance-tracker.css'],
})
export class FinanceTrackerComponent implements OnInit {
  private financeService = inject(FinanceService);

  categories: { value: FinanceCategory; label: string }[] = [
    { value: 'food',      label: 'Hrana' },
    { value: 'transport', label: 'Prevoz' },
    { value: 'goingOut',  label: 'Going out' },
    { value: 'gifts',     label: 'Pokloni' },
    { value: 'clothes',   label: 'Odjeća' },
    { value: 'pets',      label: 'Ljubimci' },
    { value: 'special',   label: 'Specijalni trošak' },
  ];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth(); // 0–11

  model: MonthlyFinance = this.emptyMonth(this.currentYear, this.currentMonth);

  // forma za pojedinačni trošak
  txDate = this.today();
  txAmount: number | null = null;
  txCategory: FinanceCategory = 'food';
  txDescription = '';

  loading = false;

  async ngOnInit(): Promise<void> {
    await this.loadCurrentMonth();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private emptyMonth(year: number, month: number): MonthlyFinance {
    return {
      year,
      month,
      income: 0,
      fixedExpenses: 0,
      transactions: [],
      nextId: 1,
    };
  }

  async changeMonth(delta: number): Promise<void> {
    const d = new Date(this.currentYear, this.currentMonth + delta, 1);
    this.currentYear = d.getFullYear();
    this.currentMonth = d.getMonth();
    await this.loadCurrentMonth();
  }

  private async loadCurrentMonth(): Promise<void> {
    this.loading = true;
    try {
      const existing = await this.financeService.loadMonth(
        this.currentYear,
        this.currentMonth
      );
      this.model = existing ?? this.emptyMonth(this.currentYear, this.currentMonth);
    } catch (e) {
      console.error(e);
      this.model = this.emptyMonth(this.currentYear, this.currentMonth);
    } finally {
      this.loading = false;
    }
  }

  private async saveMonth(): Promise<void> {
    try {
      await this.financeService.saveMonth(this.model);
    } catch (e) {
      console.error(e);
      alert('Greška pri spremanju finansija.');
    }
  }

  // --- prihodi i fiksni troškovi ---

  async onIncomeChange(): Promise<void> {
    await this.saveMonth();
  }

  async onFixedChange(): Promise<void> {
    await this.saveMonth();
  }

  // --- transakcije ---

  async addTransaction(): Promise<void> {
    if (!this.txDate || !this.txAmount || this.txAmount <= 0) return;

    const tx: FinanceTransaction = {
      id: this.model.nextId++,
      date: this.txDate,
      amount: this.txAmount,
      category: this.txCategory,
      description: this.txDescription.trim(),
    };

    this.model.transactions.unshift(tx);
    await this.saveMonth();

    this.txAmount = null;
    this.txDescription = '';
  }

  async deleteTransaction(id: number): Promise<void> {
    if (!confirm('Obrisati ovaj trošak?')) return;
    this.model.transactions = this.model.transactions.filter((t) => t.id !== id);
    await this.saveMonth();
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

  get sumByCategory(): Record<FinanceCategory, number> {
    const sums: Record<FinanceCategory, number> = {
      food: 0,
      transport: 0,
      goingOut: 0,
      gifts: 0,
      clothes: 0,
      pets: 0,
      special: 0,
    };
    for (const t of this.model.transactions) {
      sums[t.category] += t.amount;
    }
    return sums;
  }

  get percentByCategory(): Record<FinanceCategory, number> {
    const total = this.totalVariable;
    const perc: Record<FinanceCategory, number> = {
      food: 0,
      transport: 0,
      goingOut: 0,
      gifts: 0,
      clothes: 0,
      pets: 0,
      special: 0,
    };
    if (total <= 0) return perc;
    const sums = this.sumByCategory;
    (Object.keys(sums) as FinanceCategory[]).forEach((cat) => {
      perc[cat] = +((sums[cat] / total) * 100).toFixed(1);
    });
    return perc;
  }

  getMonthLabel(): string {
    return new Date(this.currentYear, this.currentMonth, 1).toLocaleString(
      'default',
      { month: 'long', year: 'numeric' }
    );
  }

  categoryLabel(cat: FinanceCategory): string {
    return this.categories.find((c) => c.value === cat)?.label || cat;
  }
}
