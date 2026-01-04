import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare const html2canvas: any;
declare const jspdf: any;

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './whiteboard.html',
  styleUrls: ['./whiteboard.css']
})
export class WhiteboardComponent implements AfterViewInit {

  @ViewChild('boardCanvas') boardCanvas!: ElementRef<HTMLCanvasElement>;

  color = '#000000';
  brushSize = 5;
  isErasing = false;

  showEmailModal = false;
  email = '';

  private ctx!: CanvasRenderingContext2D | null;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit(): void {
    const canvas = this.boardCanvas?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');

    // opcionalno, prilagodi dimenzije
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  // --- crtanje ---

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.drawing = true;
    const canvas = this.boardCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const { clientX, clientY } = this.getClientXY(event);

    this.lastX = (clientX - rect.left) * (canvas.width / rect.width);
    this.lastY = (clientY - rect.top) * (canvas.height / rect.height);
  }

  endDrawing(): void {
    this.drawing = false;
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing || !this.ctx) return;

    const canvas = this.boardCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const { clientX, clientY } = this.getClientXY(event);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    this.ctx.strokeStyle = this.isErasing ? 'black' : this.color;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }
  }

  private getClientXY(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if (event instanceof MouseEvent) {
      return { clientX: event.clientX, clientY: event.clientY };
    }
    const touch = event.touches[0] || event.changedTouches[0];
    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  onColorChange(newColor: string): void {
    this.color = newColor;
    this.isErasing = false;
  }

  toggleEraser(): void {
    this.isErasing = !this.isErasing;
  }

  clearBoard(): void {
    const canvas = this.boardCanvas.nativeElement;
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  savePng(): void {
    const canvas = this.boardCanvas.nativeElement;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'whiteboard.png';
    link.click();
  }

  // --- EMAIL (mailto varijanta) ---

  openEmailModal(): void {
    this.showEmailModal = true;
    this.email = '';
  }

  closeEmailModal(): void {
    this.showEmailModal = false;
  }

  async sendEmail(): Promise<void> {
    const to = this.email.trim();
    if (!to) return;

    const canvas = this.boardCanvas.nativeElement;

    // bez backenda: samo mailto sa base64 u body (jednostavnije rješenje)
    const img = canvas.toDataURL('image/png');
    const subject = encodeURIComponent('Whiteboard crtez');
    const body = encodeURIComponent('Crtanje:\n\n' + img);
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;

    this.showEmailModal = false;
  }

  // --- PDF ---

  savePdf(): void {
    const canvas = this.boardCanvas.nativeElement;
    if (typeof html2canvas === 'undefined') return;

    html2canvas(canvas).then((canvasImage: HTMLCanvasElement) => {
      const imgData = canvasImage.toDataURL('image/png');

      const pdfLib = (window as any).jspdf;
      if (!pdfLib || !pdfLib.jsPDF) {
        alert('jsPDF nije učitan.');
        return;
      }

      const pdf = new pdfLib.jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let imgWidth = pageWidth;
      let imgHeight = (canvas.height / canvas.width) * imgWidth;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = (canvas.width / canvas.height) * imgHeight;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('whiteboard.pdf');
    });
  }
}
