import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PlannerTask,
  PlannerDay,
  PlannerService,
} from '../../../services/planner';

@Component({
  selector: 'app-daily-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-planner.html',
  styleUrls: ['./daily-planner.css'],
})
export class DailyPlannerComponent implements OnInit {
  private plannerService = inject(PlannerService);

  hours = [
    '06:00','07:00','08:00','09:00','10:00','11:00',
    '12:00','13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00'
  ];

  selectedDate = this.today();
  model: PlannerDay = this.emptyDay(this.selectedDate);

  newTodoText = '';
  newGoalText = '';

  loading = false;

  async ngOnInit(): Promise<void> {
    await this.loadDay();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private emptyDay(date: string): PlannerDay {
    const schedule: Record<string, string> = {};
    this.hours.forEach((h) => (schedule[h] = ''));
    return {
      date,
      weather: '',
      todos: [],
      goals: [],
      schedule,
      notes: '',
      tomorrow: '',
      nextTaskId: 1,
    };
  }

  async onDateChange(): Promise<void> {
    await this.loadDay();
  }

  private async loadDay(): Promise<void> {
    this.loading = true;
    try {
      const existing = await this.plannerService.loadDay(this.selectedDate);
      this.model = existing ?? this.emptyDay(this.selectedDate);
      // osiguraj da postoji schedule za sve sate
      this.hours.forEach((h) => {
        if (!this.model.schedule[h]) this.model.schedule[h] = '';
      });
    } catch (e) {
      console.error(e);
      this.model = this.emptyDay(this.selectedDate);
    } finally {
      this.loading = false;
    }
  }

  private async saveDay(): Promise<void> {
    try {
      await this.plannerService.saveDay(this.model);
    } catch (e) {
      console.error(e);
      alert('Greška pri spremanju plana dana.');
    }
  }

  // --- weather / notes / tomorrow / schedule ---

  async onWeatherChange(): Promise<void> {
    await this.saveDay();
  }

  async onNotesChange(): Promise<void> {
    await this.saveDay();
  }

  async onTomorrowChange(): Promise<void> {
    await this.saveDay();
  }

  async onScheduleChange(): Promise<void> {
    await this.saveDay();
  }

  // --- TO DO LIST ---

  async addTodo(): Promise<void> {
    const text = this.newTodoText.trim();
    if (!text) return;

    this.model.todos.push({
      id: this.model.nextTaskId++,
      text,
      done: false,
    });
    this.newTodoText = '';
    await this.saveDay();
  }

  async toggleTodo(id: number): Promise<void> {
    const t = this.model.todos.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    await this.saveDay();
  }

  async deleteTodo(id: number): Promise<void> {
    this.model.todos = this.model.todos.filter((t) => t.id !== id);
    await this.saveDay();
  }

  // --- GOALS ---

  async addGoal(): Promise<void> {
    const text = this.newGoalText.trim();
    if (!text) return;
    this.model.goals.push(text);
    this.newGoalText = '';
    await this.saveDay();
  }

  async deleteGoal(index: number): Promise<void> {
    this.model.goals.splice(index, 1);
    await this.saveDay();
  }
}
