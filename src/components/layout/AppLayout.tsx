import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, FileVideo, LayoutDashboard, Users } from 'lucide-react';
import { canManageUsers, isStaffRole } from '@/lib/permissions';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
const SIDEBAR_COLLAPSED_KEY = 'medlearn_sidebar_collapsed';
const THEME_KEY = 'medlearn_theme';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'));
  const studentLinks = useMemo(() => [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Meus Cursos', icon: BookOpen },
  ], []);
  const teacherLinks = useMemo(
    () => [
      { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/teacher/courses', label: 'Gerenciar Cursos', icon: FileVideo },
      ...(user?.role && canManageUsers(user.role)
        ? [{ href: '/teacher/users', label: 'Gestão de Usuários', icon: Users }]
        : []),
    ],
    [user?.role],
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, navigate, user]);

  const isResolvingSession = isLoading && !user;

  if (!user || isResolvingSession) {
    return null;
  }

  const links = isStaffRole(user.role) ? teacherLinks : studentLinks;
  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        links={links}
          location={location.pathname}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => {
          setIsSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
            return next;
          });
        }}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 px-2 py-2 sm:gap-4 sm:px-3 sm:py-3 lg:px-5 lg:py-4">
        <div className="shrink-0 overflow-visible">
          <Header
            user={user}
            theme={theme}
            onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
            onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            onLogout={handleLogout}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <main className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-y-contain rounded-2xl border border-border/90 bg-background/70 p-3 text-card-foreground shadow-inner sm:p-5 md:p-6 lg:p-8 xl:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
