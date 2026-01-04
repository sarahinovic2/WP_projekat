import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlannerTask {
  id: number;
  text: string;
  done: boolean;
}

interface PlannerDay {
  date: string;                 // yyyy-mm-dd
  weather: string;              // simple string/emoji
  todos: PlannerTask[];         // to do list
  goals: string[];              // max 3–5 goals
  schedule: Record<string,string>; // "06:00" -> text
  notes: string;
  tomorrow: string;
  nextTaskId: number;
}

@Component({
  selector: 'app-daily-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-planner.html',
  styleUrls: ['./daily-planner.css']
})
export class DailyPlannerComponent {

  hours = [
    '06:00','07:00','08:00','09:00','10:00','11:00',
    '12:00','13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00'
  ];

  selectedDate = this.today();
  model: PlannerDay = this.emptyDay(this.selectedDate);

  // helper za novi todo
  newTodoText = '';
  newGoalText = '';

  constructor() {
    this.loadDay();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private storageKey(date: string): string {
    return 'planner-' + date;
  }

  private emptyDay(date: string): PlannerDay {
    const schedule: Record<string,string> = {};
    this.hours.forEach(h => schedule[h] = '');
    return {
      date,
      weather: '',
      todos: [],
      goals: [],
      schedule,
      notes: '',
      tomorrow: '',
      nextTaskId: 1
    };
  }

  onDateChange(): void {
    this.loadDay();
  }

  private loadDay(): void {
    const key = this.storageKey(this.selectedDate);
    const raw = localStorage.getItem(key);
    if (!raw) {
      this.model = this.emptyDay(this.selectedDate);
      return;
    }
    try {
      this.model = JSON.parse(raw) as PlannerDay;
      // osiguraj da postoji schedule za sve sate
      this.hours.forEach(h => {
        if (!this.model.schedule[h]) this.model.schedule[h] = '';
      });
    } catch {
      this.model = this.emptyDay(this.selectedDate);
    }
  }

  private saveDay(): void {
    const key = this.storageKey(this.selectedDate);
    localStorage.setItem(key, JSON.stringify(this.model));
  }

  // --- weather / notes / tomorrow ---

  onWeatherChange(): void {
    this.saveDay();
  }

  onNotesChange(): void {
    this.saveDay();
  }

  onTomorrowChange(): void {
    this.saveDay();
  }

  onScheduleChange(): void {
    this.saveDay();
  }

  // --- TO DO LIST ---

  addTodo(): void {
    const text = this.newTodoText.trim();
    if (!text) return;

    this.model.todos.push({
      id: this.model.nextTaskId++,
      text,
      done: false
    });
    this.newTodoText = '';
    this.saveDay();
  }

  toggleTodo(id: number): void {
    const t = this.model.todos.find(x => x.id === id);
    if (!t) return;
    t.done = !t.done;
    this.saveDay();
  }

  deleteTodo(id: number): void {
    this.model.todos = this.model.todos.filter(t => t.id !== id);
    this.saveDay();
  }

  // --- GOALS ---

  addGoal(): void {
    const text = this.newGoalText.trim();
    if (!text) return;
    this.model.goals.push(text);
    this.newGoalText = '';
    this.saveDay();
  }

  deleteGoal(index: number): void {
    this.model.goals.splice(index, 1);
    this.saveDay();
  }
}
