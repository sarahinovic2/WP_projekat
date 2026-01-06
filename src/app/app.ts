import { Component, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeName } from './services/theme.service'
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from '@firebase/auth';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('WP_projekat');

  // auth state
  isLoggedIn = false;
  private currentUid: string | null = null;

  constructor(
    protected themeService: ThemeService,
    private auth: Auth,
    private authService: AuthService,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
      this.currentUid = user ? user.uid : null;
    });
  }

  protected get themes() { return this.themeService.availableThemes; }

  protected get mode(): 'light' | 'dark' { return this.themeService.getThemeChoice().mode; }

  setTheme(themeId: ThemeName) {
    this.themeService.setTheme(themeId, this.mode);
  }

  toggleMode() {
    this.themeService.toggleMode();

    // If user is logged in, persist the mode choice to their stored profile (local registered-users)
    if (this.isLoggedIn && this.currentUid) {
      try {
        const raw = localStorage.getItem('registered-users');
        const users = raw ? JSON.parse(raw) : [];
        const found = users.find((u: any) => u.uid === this.currentUid);
        if (found) {
          const current = this.themeService.getThemeChoice();
          found.theme = { name: current.name, mode: current.mode };
          localStorage.setItem('registered-users', JSON.stringify(users));
        }
      } catch (e) {
        console.warn('Could not persist theme change to user profile', e);
      }
    }
  }

  get currentTheme(): ThemeName {
    return this.themeService.getThemeChoice().name;
  }

  get currentThemeLabel(): string {
    const t = this.themes.find(x => x.id === this.currentTheme as any);
    return t ? t.label : String(this.currentTheme);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (e) => {
        console.error(e);
        alert('Logout failed.');
      }
    });
  }
}
