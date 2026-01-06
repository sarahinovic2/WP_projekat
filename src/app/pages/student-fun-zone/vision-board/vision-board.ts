import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';

// allow dynamic imports without strict types if packages aren't installed yet
declare module 'html2canvas';
declare module 'jspdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BoardItem {
  id: number;
  type: 'note' | 'quote' | 'image';
  x: number;
  y: number;
  text?: string;
  src?: string;
  color?: string;
}

@Component({
  selector: 'app-vision-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vision-board.html',
  styleUrls: ['./vision-board.css']
})
export class VisionBoardComponent {

  @ViewChild('board', { static: false }) board!: ElementRef;

  items: BoardItem[] = [];
  activeItem: BoardItem | null = null;
  offsetX = 0;
  offsetY = 0;

  constructor() {
    const saved = localStorage.getItem('visionBoard');
    if (saved) this.items = JSON.parse(saved);
  }

  /* ===== ADD ELEMENTS ===== */

  addNote() {
    this.addItem('note', '');
  }

  addQuote() {
    this.addItem('quote', 'Your quote here...');
  }

  addItem(type: 'note' | 'quote', text: string) {
    this.items.push({
      id: Date.now(),
      type,
      text,
      x: 100,
      y: 100,
      color: this.randomColor()
    });
    this.save();
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.items.push({
        id: Date.now(),
        type: 'image',
        src: reader.result as string,
        x: 120,
        y: 120
      });
      this.save();
    };
    reader.readAsDataURL(file);
  }

  /* ===== DRAG ===== */

  startDrag(event: MouseEvent, item: BoardItem) {
    this.activeItem = item;
    this.offsetX = event.clientX - item.x;
    this.offsetY = event.clientY - item.y;
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (!this.activeItem) return;
    this.activeItem.x = event.clientX - this.offsetX;
    this.activeItem.y = event.clientY - this.offsetY;
  }

  @HostListener('document:mouseup')
  stopDrag() {
    if (this.activeItem) this.save();
    this.activeItem = null;
  }

  /* ===== DELETE ===== */

  removeItem(id: number) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  /* ===== SAVE ===== */

  save() {
    localStorage.setItem('visionBoard', JSON.stringify(this.items));
  }

  /* ===== EXPORT ===== */

  // Export to PNG — dynamic import and typed canvas callback, with graceful fallback
  exportPNG() {
    import('html2canvas')
      .then((mod: any) => {
        const h2c = (mod && (mod.default || mod));
        return h2c(this.board.nativeElement);
      })
      .then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = 'vision-board.png';
        link.href = canvas.toDataURL();
        link.click();
      })
      .catch((err: any) => {
        console.warn('html2canvas not available', err);
        alert('PNG export requires html2canvas.');
      });
  }

  // Export to PDF — dynamically load html2canvas and jsPDF, type-check, and fallback
  exportPDF() {
    Promise.all([import('html2canvas'), import('jspdf')])
      .then(([hmod, jmod]: any) => {
        const h2c = (hmod && (hmod.default || hmod));
        const jsPDF = (jmod && (jmod.default || jmod));
        if (!h2c || !jsPDF) throw new Error('Missing libraries');
        return h2c(this.board.nativeElement).then((canvas: HTMLCanvasElement) => ({ canvas, jsPDF }));
      })
      .then(({ canvas, jsPDF }: any) => {
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'px', 'a4');
        pdf.addImage(img, 'PNG', 0, 0);
        pdf.save('vision-board.pdf');
      })
      .catch((err: any) => {
        console.warn('PDF export failed', err);
        alert('PDF export requires html2canvas and jsPDF.');
      });
  }

  /* ===== EMAIL ===== */

  sendEmail() {
    const body = encodeURIComponent('My Vision Board:\n\n' +
      this.items.map(i => i.text || 'Image').join('\n')
    );
    window.location.href = `mailto:?subject=My Vision Board&body=${body}`;
  }

  private randomColor(): string {
    const colors = ['#fff7a8', '#c7f9cc', '#bae6fd', '#fbcfe8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
