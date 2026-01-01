import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const html2canvas: any;
declare const jspdf: any;

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './kanban-board.html',
  styleUrls: ['./kanban-board.css']
})
export class KanbanBoardComponent implements AfterViewInit {

  showTaskModal = false;
  showClearModal = false;
  showEmailModal = false;

  taskText = '';
  email = '';

  ngAfterViewInit(): void {
    console.log('KanbanBoardComponent initialized');
    try {
      this.setupDragAndDrop();
    } catch (err) {
      console.error('Kanban setupDragAndDrop error', err);
    }
  }

  // --- MODALI ---

  openTaskModal(): void {
    this.showTaskModal = true;
    this.taskText = '';
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
  }

  openClearModal(): void {
    this.showClearModal = true;
  }

  closeClearModal(): void {
    this.showClearModal = false;
  }

  openEmailModal(): void {
    this.showEmailModal = true;
    this.email = '';
  }

  closeEmailModal(): void {
    this.showEmailModal = false;
  }

  // --- ZADACI ---

  addTask(): void {
    const text = this.taskText.trim();
    if (!text) return;

    const task = this.createTask(text);
    const todoList = document.querySelector('[data-status="todo"] .taskList') as HTMLElement | null;
    if (todoList) todoList.appendChild(task);

    this.showTaskModal = false;
  }

  private createTask(text: string): HTMLElement {
    const task = document.createElement('div');
    task.classList.add('task');
    task.textContent = text;
    task.draggable = true;

    task.addEventListener('dragstart', () => task.classList.add('dragging'));
    task.addEventListener('dragend', () => task.classList.remove('dragging'));

    return task;
  }

  private setupDragAndDrop(): void {
    document.querySelectorAll('.taskList').forEach(list => {
      list.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging') as HTMLElement | null;
        if (dragging) list.appendChild(dragging);
      });
    });
  }

  clearBoard(): void {
    document.querySelectorAll('.taskList').forEach(list => (list.innerHTML = ''));
    this.showClearModal = false;
  }

  // --- SNIMANJE PNG/PDF ---

  saveBoardPng(): void {
    const board = document.querySelector('.board') as HTMLElement | null;
    if (!board || typeof html2canvas === 'undefined') return;

    html2canvas(board).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = 'kanban_board.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  saveBoardPdf(): void {
    const board = document.querySelector('.board') as HTMLElement | null;
    if (!board || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
      alert('PDF export nije dostupan.');
      return;
    }

    html2canvas(board).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');

      const pdfLib = (window as any).jspdf;
      if (!pdfLib || !pdfLib.jsPDF) {
        alert('jsPDF library not loaded.');
        return;
      }

      const pdf = new pdfLib.jsPDF('landscape', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('kanban_board.pdf');
    });
  }

  // --- MAIL (bez PHP backenda, samo mailto) ---

  async sendEmail(): Promise<void> {
    const email = this.email.trim();
    if (!email) return;

    let content = '';
    document.querySelectorAll('.column').forEach(col => {
      const title = (col.querySelector('h2')?.textContent ?? '').trim();
      const tasks = Array.from(col.querySelectorAll('.task')).map(t => '- ' + t.textContent).join('\n');
      content += `${title}:\n${tasks || 'Nema zadataka'}\n\n`;
    });

    const subject = encodeURIComponent('Kanban ploča');
    const body = encodeURIComponent(content);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    this.showEmailModal = false;
  }
}
