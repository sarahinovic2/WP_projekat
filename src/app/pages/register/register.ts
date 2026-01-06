import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeName, ThemeMode } from '../../services/theme.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  theme: ThemeName = 'retro';
  mode: ThemeMode = 'light';

  themes: Array<{ id: ThemeName; label: string }> = [];

  constructor(
    private themeService: ThemeService,
    private auth: AuthService,
    private router: Router
  ) {
    this.themes = this.themeService.availableThemes;
    const current = this.themeService.getThemeChoice();
    this.theme = current.name || this.theme;
    this.mode = current.mode || this.mode;
  }

  onSubmit(): void {
    this.auth.register(this.email, this.password).subscribe({
      next: (user) => {
        // lokalno i dalje možemo sačuvati theme za sada
        try {
          const usersRaw = localStorage.getItem('registered-users');
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          users.push({
            uid: user.uid,
            name: this.name,
            email: this.email,
            theme: { name: this.theme, mode: this.mode },
          });
          localStorage.setItem('registered-users', JSON.stringify(users));
        } catch (e) {
          console.warn('Could not persist registered user locally', e);
        }

        this.themeService.setTheme(this.theme, this.mode);
        alert('Registracija uspješna.');
        this.router.navigate(['/login']); // ili direktno na dashboard
      },
      error: (err) => {
        console.error('Register error', err);
        alert('Greška pri registraciji: ' + (err.message || 'pokušaj ponovo'));
      },
    });
  }

  onThemeChange(): void {
    this.themeService.setTheme(this.theme, this.mode);
  }

  toggleModeCheckbox(checked: boolean): void {
    this.mode = checked ? 'dark' : 'light';
    this.onThemeChange();
  }
}
