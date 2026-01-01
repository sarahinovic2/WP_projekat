import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare const html2canvas: any;

@Component({
  selector: 'app-vision-board',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './vision-board.html',
  styleUrls: ['./vision-board.css']
})
export class VisionBoardComponent implements AfterViewInit {

  // stanje za email modal
  showEmailModal = false;
  email = '';

  // konstante iz originalnog koda
  private noteColors = ['#f5e6c4', '#f8e0b0', '#fff1a8', '#eaf2b8'];
  private quoteColors = ['#d5b893', '#d1c78d', '#cfc27f'];
  private sampleImages = [
    'assets/slike/slika1.png',
    'assets/slike/slika2.png',
    'assets/slike/slika3.png',
    'assets/slike/slika4.png'
  ];
  private sampleQuotes = [
    'Svaka dovoljno napredna tehnologija jednaka je magiji. - Arthur C. Clarke',
    'Tehnologija je riječ koja opisuje nešto što još ne funkcionira. - Douglas Adams',
    'Ne osnivate zajednice. Zajednice već postoje. Pitanje je kako im možete pomoći da budu bolje. - Mark Zuckerberg'
  ];

  ngAfterViewInit(): void {
    this.loadBoard();
  }

  // --- pomoćne funkcije ---

  private get board(): HTMLElement | null {
    return document.getElementById('board');
  }

  private makeDraggable(el: HTMLElement): void {
    let offsetX = 0;
    let offsetY = 0;

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'delete-btn';
    el.appendChild(delBtn);

    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.remove();
    });

    const dragStart = (e: MouseEvent) => {
      if (e.target === delBtn) return;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);
    };

    const drag = (e: MouseEvent) => {
      e.preventDefault();
      el.style.left = e.clientX - offsetX + 'px';
      el.style.top = e.clientY - offsetY + 'px';
    };

    const dragEnd = () => {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
    };

    el.addEventListener('mousedown', dragStart);
  }

  // --- dodavanje elemenata ---

  addNote(): void {
    const board = this.board;
    if (!board) return;

    const note = document.createElement('div');
    note.className = 'note';
    note.style.backgroundColor =
      this.noteColors[Math.floor(Math.random() * this.noteColors.length)];
    note.contentEditable = 'true';
    note.style.left = Math.random() * (board.offsetWidth - 160) + 'px';
    note.style.top = Math.random() * (board.offsetHeight - 120) + 'px';
    note.textContent = 'Napiši nešto...';
    this.makeDraggable(note);
    board.appendChild(note);
  }

  addQuote(): void {
    const board = this.board;
    if (!board) return;

    const quote = document.createElement('div');
    quote.className = 'quote';
    quote.style.backgroundColor =
      this.quoteColors[Math.floor(Math.random() * this.quoteColors.length)];
    quote.contentEditable = 'true';
    quote.style.left = Math.random() * (board.offsetWidth - 130) + 'px';
    quote.style.top = Math.random() * (board.offsetHeight - 100) + 'px';
    quote.textContent =
      this.sampleQuotes[Math.floor(Math.random() * this.sampleQuotes.length)];
    this.makeDraggable(quote);
    board.appendChild(quote);
  }

  addImage(): void {
    const board = this.board;
    if (!board) return;

    const div = document.createElement('div');
    div.className = 'pinned-img';
    div.style.left = Math.random() * (board.offsetWidth - 140) + 'px';
    div.style.top = Math.random() * (board.offsetHeight - 140) + 'px';

    const img = document.createElement('img');
    img.src =
      this.sampleImages[Math.floor(Math.random() * this.sampleImages.length)];
    img.crossOrigin = 'anonymous';
    div.appendChild(img);

    this.makeDraggable(div);
    board.appendChild(div);
  }

  // --- save / load ---

  saveBoard(): void {
    const board = this.board;
    if (!board) return;

    const items: any[] = [];
    board.querySelectorAll(':scope > div').forEach(el => {
      const div = el as HTMLElement;
      items.push({
        type: div.className.includes('note')
          ? 'note'
          : div.className.includes('quote')
          ? 'quote'
          : 'image',
        html: div.innerHTML,
        left: div.style.left,
        top: div.style.top
      });
    });

    localStorage.setItem('visionBoardItems', JSON.stringify(items));
    alert('Board saved!');
  }

  loadBoard(): void {
    const board = this.board;
    if (!board) return;

    const data = localStorage.getItem('visionBoardItems');
    if (!data) return;
    const items = JSON.parse(data);

    items.forEach((item: any) => {
      const div = document.createElement('div');
      div.className = item.type;
      div.style.left = item.left;
      div.style.top = item.top;
      div.innerHTML = item.html;
      if (item.type !== 'image') div.contentEditable = 'true';
      this.makeDraggable(div);
      board.appendChild(div);
    });
  }

  clearBoard(): void {
    const board = this.board;
    if (!board) return;

    if (confirm('Clear the board?')) {
      board.innerHTML = '';
      localStorage.removeItem('visionBoardItems');
    }
  }

  // --- PNG / PDF ---

  async exportPng(): Promise<void> {
    const board = this.board;
    if (!board || typeof html2canvas === 'undefined') return;

    const canvas = await html2canvas(board);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'vision_board.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async exportPdf(): Promise<void> {
    const board = this.board;
    if (!board || typeof html2canvas === 'undefined') {
      alert('html2canvas nije učitan.');
      return;
    }

    const canvas = await html2canvas(board, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdfLib = (window as any).jspdf;
    if (!pdfLib || !pdfLib.jsPDF) {
      alert('jsPDF nije učitan.');
      return;
    }

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
    pdf.save('vision_board.pdf');
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
    const email = this.email.trim();
    if (!email) return;

    let content = '';
    document.querySelectorAll('.note, .quote').forEach(el => {
      const div = el as HTMLElement;
      content += div.classList.contains('note') ? '[NOTE] ' : '[QUOTE] ';
      content += (div.textContent || '').trim() + '\n\n';
    });

    const subject = encodeURIComponent('Vision Board');
    const body = encodeURIComponent(content);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    this.showEmailModal = false;
  }
}
