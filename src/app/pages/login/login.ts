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
        try {
          const usersRaw = localStorage.getItem('registered-users');
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          // find by uid or email
          const stored = users.find((u: any) => u.uid === user.uid || u.email === this.email);
          if (stored && stored.theme) {
            this.themeService.setTheme(stored.theme.name, stored.theme.mode);
          }
        } catch (e) {
          console.warn('Could not apply stored theme', e);
        }

        alert('Prijava uspješna.');
        this.router.navigate(['/trackers']);
      },
      error: (err) => {
        console.error('Login error', err);
        alert('Greška pri prijavi: ' + (err.message || 'pokušaj ponovo'));
      },
    });
  }
}
