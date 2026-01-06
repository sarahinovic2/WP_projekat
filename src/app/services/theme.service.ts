// src/app/services/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export type ThemeName = 'retro' | 'cyberpunk' | 'whimsical-forest' | 'classical';
export type ThemeMode = 'light' | 'dark';

export interface ThemeChoice {
  name: ThemeName;
  mode: ThemeMode;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private current: ThemeChoice = { name: 'cyberpunk', mode: 'light' };
  private readonly storageKey = 'user-theme';

  // single source of available themes — update if you add CSS rules for themes
  readonly availableThemes: Array<{ id: ThemeName; label: string }> = [
    { id: 'retro', label: 'Retro' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'classical', label: 'Classical' },
    { id: 'whimsical-forest', label: 'Whimsical Forest' },
  ];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // load stored theme (supports legacy string and new JSON format)
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as ThemeChoice;
          if (parsed && parsed.name) {
            this.current = parsed as ThemeChoice;
          } else {
            // legacy single-string value (e.g. "cyberpunk" or mode-only "dark"/"light")
            if (raw === 'dark' || raw === 'light') {
              this.current = { name: this.current.name, mode: raw as ThemeMode };
            } else {
              this.current = { name: raw as ThemeName, mode: 'light' };
            }
          }
        } catch (e) {
          // not JSON, treat as legacy value
          if (raw === 'dark' || raw === 'light') {
            this.current = { name: this.current.name, mode: raw as ThemeMode };
          } else {
            this.current = { name: raw as ThemeName, mode: 'light' };
          }
        }
      }
    }

    // Only manipulate DOM when running in the browser
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.applyToBody();
    }
  }

  getThemeChoice(): ThemeChoice {
    return this.current;
  }

  setTheme(name: ThemeName, mode: ThemeMode = 'light'): void {
    const previous = { ...this.current };
    this.current = { name, mode };

    if (typeof document !== 'undefined') {
      const docEl = document.documentElement; // use <html> data attributes for new CSS tokens

      // remove previous classes (keep for backwards compat)
      if (previous) {
        this.renderer.removeClass(document.body, `theme-${previous.name}`);
        this.renderer.removeClass(document.body, `mode-${previous.mode}`);
      }

      // also set data- attributes on the <html> element so css like
      // html[data-theme="retro"][data-mode="dark"] { ... }
      this.renderer.setAttribute(docEl, 'data-theme', String(name));
      this.renderer.setAttribute(docEl, 'data-mode', String(mode));

      // add small backward-compat classes on body too
      this.renderer.addClass(document.body, `theme-${name}`);
      this.renderer.addClass(document.body, `mode-${mode}`);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.current));
    }
  }

  toggleMode(): void {
    this.setTheme(this.current.name, this.current.mode === 'light' ? 'dark' : 'light');
  }

  private applyToBody(): void {
    const docEl = document.documentElement;
    // set data attributes on <html> so theme CSS (data-theme / data-mode) applies
    this.renderer.setAttribute(docEl, 'data-theme', String(this.current.name));
    this.renderer.setAttribute(docEl, 'data-mode', String(this.current.mode));

    // and keep body classes for older rules
    const body = document.body;
    this.renderer.addClass(body, `theme-${this.current.name}`);
    this.renderer.addClass(body, `mode-${this.current.mode}`);
  }
}
