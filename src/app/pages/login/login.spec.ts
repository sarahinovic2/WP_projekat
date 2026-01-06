import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private themeService: ThemeService,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        // TODO: kasnije ćemo ovdje učitati theme iz Firestore-a.
        alert('Uspješna prijava.');
        this.router.navigate(['/dashboard']); // promijeni u svoju početnu rutu
      },
      error: (err) => {
        console.error('Login error', err);
        alert('Greška pri prijavi: ' + (err.message || 'pokušaj ponovo'));
      },
    });
  }
}
