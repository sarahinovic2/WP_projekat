import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const html2canvas: any;

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whiteboard.html',
  styleUrls: ['./whiteboard.css']
})

export class WhiteboardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  showEmailModal = false;
  email = '';

  penColor = '#111827';
  penSize = 4;
  tool: 'pen' | 'eraser' = 'pen';

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.setupCanvas(canvas);
    window.addEventListener('resize', () => this.resizeCanvas(canvas));
    this.resizeCanvas(canvas);
  }

  private setupCanvas(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    // Fill background white so exported PNGs have a solid background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pointer events
    canvas.addEventListener('pointerdown', (e: PointerEvent) => this.start(e, canvas));
    canvas.addEventListener('pointermove', (e: PointerEvent) => this.move(e, canvas));
    canvas.addEventListener('pointerup', () => this.end());
    canvas.addEventListener('pointercancel', () => this.end());
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    // preserve content by copying to temporary canvas
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tctx = temp.getContext('2d');
    if (tctx && this.ctx) tctx.drawImage(canvas, 0, 0);

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * ratio);
    canvas.height = Math.floor(canvas.clientHeight * ratio);

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.ctx.scale(ratio, ratio);

    // redraw background and previous content
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    if (tctx) this.ctx.drawImage(temp, 0, 0, canvas.width / ratio, canvas.height / ratio);
  }

  private start(e: PointerEvent, canvas: HTMLCanvasElement): void {
    this.drawing = true;
    const rect = canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;

    // set tool
    if (this.tool === 'eraser') {
      if (this.ctx) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineWidth = this.penSize * 2;
        this.ctx.lineCap = 'round';
      }
    } else {
      if (this.ctx) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.penColor;
        this.ctx.lineWidth = this.penSize;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
      }
    }

    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
    }

    try { (canvas as any).setPointerCapture?.((e as any).pointerId); } catch {}
  }

  private move(e: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!this.drawing || !this.ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  private end(): void {
    this.drawing = false;
    if (this.ctx) this.ctx.closePath();
  }

  setTool(tool: 'pen' | 'eraser') { this.tool = tool; }

  clearCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;
    const ratio = window.devicePixelRatio || 1;
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
  }

  savePng(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const png = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = png;
    link.download = 'whiteboard.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async exportPdf(): Promise<void> {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || typeof html2canvas === 'undefined') {
      alert('html2canvas nije učitan.');
      return;
    }

    const rendered = await html2canvas(canvas, { scale: 2 });
    const imgData = rendered.toDataURL('image/png');

    const pdfLib = (window as any).jspdf;
    if (!pdfLib || !pdfLib.jsPDF) { alert('jsPDF nije učitan.'); return; }

    const pdf = new pdfLib.jsPDF('l', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const img = new Image();
    img.src = imgData;
    await new Promise(res => (img.onload = res));

    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    const imgWidth = img.width * ratio;
    const imgHeight = img.height * ratio;
    const marginX = (pageWidth - imgWidth) / 2;
    const marginY = 20;

    pdf.addImage(imgData, 'PNG', marginX, marginY, imgWidth, imgHeight);
    pdf.save('whiteboard.pdf');
  }

  openEmailModal() { this.showEmailModal = true; this.email = ''; }
  closeEmailModal() { this.showEmailModal = false; }

  async sendEmail() {
    const email = this.email.trim();
    if (!email) return;

    // If html2canvas not available, fallback to mailto with text message
    if (typeof html2canvas === 'undefined') {
      const subject = encodeURIComponent('Whiteboard');
      const body = encodeURIComponent('Whiteboard saved from IPI app.');
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      this.showEmailModal = false;
      return;
    }

    try {
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) throw new Error('Canvas not found');
      const rendered = await html2canvas(canvas, { scale: 2 });
      const png = rendered.toDataURL('image/png');
      const base64 = png.split(',')[1];

      const form = new URLSearchParams();
      form.append('filename', 'whiteboard.png');
      form.append('filedata', base64);
      form.append('to', email);
      form.append('subject', 'Whiteboard');
      form.append('message', 'Sent from IPI Whiteboard');

      const res = await fetch('/root/StudentFunZone/send_mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: form.toString()
      });

      const text = await res.text();
      if (res.ok) alert('Email sent!'); else alert('Send failed: ' + text);
    } catch (err) {
      console.error(err);
      alert('Error sending — fallback to mailto.');
      const subject = encodeURIComponent('Whiteboard');
      const body = encodeURIComponent('Whiteboard saved from IPI app.');
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }

    this.showEmailModal = false;
  }
}
