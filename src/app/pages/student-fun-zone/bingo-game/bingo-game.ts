import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const html2canvas: any;

@Component({
  selector: 'app-bingo-game',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './bingo-game.html',
  styleUrls: ['./bingo-game.css']
})
export class BingoGameComponent implements AfterViewInit {

  showEmailModal = false;
  email = '';

  ngAfterViewInit(): void {
    this.generateCard();
  }

  // --- BINGO LOGIKA ---

  generateCard(): void {
    const table = document.getElementById('bingoTable') as HTMLTableElement | null;
    if (!table) return;

    table.innerHTML = '';
    const numbers: number[] = [];

    while (numbers.length < 25) {
      const num = Math.floor(Math.random() * 75) + 1;
      if (!numbers.includes(num)) numbers.push(num);
    }

    for (let i = 0; i < 5; i++) {
      const row = table.insertRow();
      for (let j = 0; j < 5; j++) {
        const cell = row.insertCell();
        const index = i * 5 + j;

        if (i === 2 && j === 2) {
          cell.textContent = '★';
          cell.classList.add('free', 'marked');
        } else {
          cell.textContent = String(numbers[index]);
        }

        cell.style.border = '1px solid #000';
        cell.style.padding = '10px';
        cell.style.textAlign = 'center';
        cell.style.cursor = 'pointer';

        cell.addEventListener('click', () => {
          if (!cell.classList.contains('free')) {
            cell.classList.toggle('marked');
            if (this.checkBingo()) {
              alert('BINGO! Čestitamo!');
              this.generateCard();
            }
          }
        });
      }
    }
  }

  private checkBingo(): boolean {
    const table = document.getElementById('bingoTable') as HTMLTableElement | null;
    if (!table) return false;

    const cells: boolean[][] = [];

    for (let i = 0; i < 5; i++) {
      const row: boolean[] = [];
      for (let j = 0; j < 5; j++) {
        const cell = table.rows[i].cells[j];
        row.push(cell.classList.contains('marked') || cell.classList.contains('free'));
      }
      cells.push(row);
    }

    // redovi
    for (let i = 0; i < 5; i++) if (cells[i].every(v => v)) return true;
    // kolone
    for (let j = 0; j < 5; j++) if ([0,1,2,3,4].every(i => cells[i][j])) return true;
    // dijagonale
    if ([0,1,2,3,4].every(i => cells[i][i])) return true;
    if ([0,1,2,3,4].every(i => cells[i][4 - i])) return true;

    return false;
  }

  // --- DUGMAD NA INTERFEJSU ---

  generateNewCard(): void {
    this.generateCard();
  }

  async downloadPdf(): Promise<void> {
    await this.exportBingoToPdf();
  }

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
    await this.sendBingoByEmail(to, 'Bingo karta');
    this.showEmailModal = false;
  }

  // --- EXPORT PNG/PDF I MAIL ---

  private async exportBingoToPdf(filename = 'bingo.pdf'): Promise<void> {
    const el = document.getElementById('contentToConvert');
    if (!el || typeof html2canvas === 'undefined') {
      alert('PDF export nije dostupan.');
      return;
    }

    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const jspdfAny = (window as any).jspdf;
    if (!jspdfAny || !jspdfAny.jsPDF) {
      alert('jsPDF library not loaded. PDF export unavailable.');
      return;
    }

    const pdf = new jspdfAny.jsPDF('p', 'pt', 'a4');
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
    pdf.save(filename);
  }

  private async sendBingoByEmail(to: string, subject = 'Bingo karta'): Promise<void> {
    const el = document.getElementById('contentToConvert');
    if (!el) return;

    if (typeof html2canvas === 'undefined') {
      const body = encodeURIComponent('Bingo karta iz Student Fun Zone.');
      window.location.href =
        `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
      return;
    }

    const canvas = await html2canvas(el, { scale: 2 });
    const png = canvas.toDataURL('image/png');
    const base64 = png.split(',')[1];

    try {
      const form = new URLSearchParams();
      form.append('filename', 'bingo.png');
      form.append('filedata', base64);
      form.append('to', to);
      form.append('subject', subject);
      form.append('message', 'Poslan iz Student Fun Zone - Bingo.');

      const res = await fetch('/root/StudentFunZone/send_mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: form.toString()
      });

      const text = await res.text();
      if (res.ok) alert('Poruka poslana.');
      else alert('Greška pri slanju: ' + text);
    } catch (err) {
      console.error(err);
      alert('Greška pri slanju, provjerite konzolu.');
    }
  }
}
