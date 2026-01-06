import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {
  ime = '';
  prezime = '';
  email = '';
  telefon = '';
  poruka = '';
  pristanak = false;

  submitted = false;

  onSubmit(): void {
    if (!this.pristanak) {
      alert('Molimo prihvatite obradu ličnih podataka.');
      return;
    }

    const msg = {
      ime: this.ime,
      prezime: this.prezime,
      email: this.email,
      telefon: this.telefon,
      poruka: this.poruka,
      date: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem('contact-messages');
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(msg);
      localStorage.setItem('contact-messages', JSON.stringify(arr));
    } catch (e) {
      console.warn('Could not save message', e);
    }

    this.submitted = true;
    // reset form
    this.ime = this.prezime = this.email = this.telefon = this.poruka = '';
    this.pristanak = false;
  }
}
