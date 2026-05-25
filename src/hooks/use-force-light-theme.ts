import { useEffect } from 'react';
import { applyStoredTheme } from '@/lib/theme';

/**
 * Mantém tema claro em páginas públicas de autenticação.
 * Ao sair da rota, restaura o tema salvo para a área logada.
 */
export function useForceLightTheme(): void {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      applyStoredTheme();
    };
  }, []);
}
