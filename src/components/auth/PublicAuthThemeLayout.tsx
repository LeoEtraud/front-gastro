import { Outlet } from 'react-router-dom';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';

/** Envolve rotas públicas de login/cadastro/recuperação de senha com tema claro fixo. */
export function PublicAuthThemeLayout() {
  useForceLightTheme();
  return <Outlet />;
}
