export const THEME_KEY = 'medlearn_theme';

export type ThemeMode = 'light' | 'dark';

export function getStoredTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

/** Aplica o tema salvo no localStorage (área autenticada). */
export function applyStoredTheme(): void {
  applyTheme(getStoredTheme());
}
