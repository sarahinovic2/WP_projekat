import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css'],
})
export class Schedule {
  selectedYear = '';

  // helper used by template to test selection
  isYear(year: string): boolean {
    return this.selectedYear === year;
  }
}
