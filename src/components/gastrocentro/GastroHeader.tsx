import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GastroButton } from '@/components/gastrocentro/GastroButton';
import {
  GASTRO_APPOINTMENT_URL,
  gastroNavItems,
  handleGastroAnchorClick,
  type GastroNavItem,
} from '@/components/gastrocentro/gastro-nav';
import { cn } from '@/lib/utils';

const HEADER_HEIGHT = 'h-[72px]';

function NavLink({
  item,
  onNavigate,
  className,
}: {
  item: GastroNavItem;
  onNavigate?: () => void;
  className?: string;
}) {
  const short = 'shortLabel' in item ? item.shortLabel : undefined;

  return (
    <a
      href={item.href}
      onClick={(e) => handleGastroAnchorClick(e, item.href, onNavigate)}
      className={cn(
        'whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-bold text-white transition hover:bg-white/10 hover:text-white xl:px-3',
        className,
      )}
    >
      {short ? (
        <>
          <span className="xl:hidden">{short}</span>
          <span className="hidden xl:inline">{item.label}</span>
        </>
      ) : (
        item.label
      )}
    </a>
  );
}

export function GastroHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileMenu = () => setOpen(false);

  return (
    <>
      <header
        className={cn(
          'gc-font fixed top-0 z-50 w-full border-b transition-all duration-300',
          scrolled
            ? 'border-white/10 bg-gc-navy/82 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-md'
            : 'border-transparent bg-gc-navy/95 backdrop-blur-sm',
        )}
      >
        <div
          className={cn(
            'mx-auto grid w-full max-w-[100%] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8 xl:px-10',
            HEADER_HEIGHT,
          )}
        >
          {/* Logo — extremo esquerdo */}
          <a
            href="#topo"
            onClick={(e) => handleGastroAnchorClick(e, '#topo')}
            className="flex min-w-0 shrink-0 items-center gap-2.5 justify-self-start"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gc-teal to-gc-coral">
              <Activity className="h-[18px] w-[18px] text-white" aria-hidden />
            </span>
            <span className="truncate text-lg font-bold tracking-tight text-white">GastroCentro</span>
          </a>

          {/* Navegação — centro (desktop) */}
          <nav
            className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex xl:gap-1"
            aria-label="Principal"
          >
            {gastroNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Ações — extremo direito */}
          <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2 lg:gap-3">
            <div className="hidden items-center gap-3 lg:flex xl:gap-4">
              <GastroButton href="/login" variant="secondary" className="h-10 whitespace-nowrap px-4 text-[13px] xl:px-5">
                Acessar plataforma
              </GastroButton>
              <GastroButton href={GASTRO_APPOINTMENT_URL} variant="primary" className="h-10 whitespace-nowrap px-4 text-[13px] xl:px-5">
                Agendar atendimento
              </GastroButton>
            </div>

            {/* Mobile / tablet: Agendar + menu (ícone à direita) */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
              <GastroButton
                href={GASTRO_APPOINTMENT_URL}
                variant="primary"
                className="hidden h-9 px-3 text-xs sm:inline-flex sm:h-10 sm:px-4 sm:text-[13px]"
              >
                Agendar
              </GastroButton>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-white hover:bg-white/10"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="gc-font w-[min(100vw-1rem,22rem)] border-gc-mid bg-gc-navy text-white">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-white">Navegação</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1" aria-label="Principal">
                    {gastroNavItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleGastroAnchorClick(e, item.href, closeMobileMenu)}
                        className="rounded-xl px-3 py-3 font-bold text-white hover:bg-white/10"
                      >
                        {item.label}
                      </a>
                    ))}
                    <a
                      href={GASTRO_APPOINTMENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-gc-coral px-6 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(255,107,53,0.45)] hover:bg-[#e85f2d] sm:hidden"
                    >
                      Agendar atendimento
                    </a>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="mt-3 rounded-full border border-white/35 px-4 py-3 text-center font-semibold text-white hover:bg-white/10 sm:mt-4"
                    >
                      Acessar plataforma
                    </Link>
                    <a
                      href={GASTRO_APPOINTMENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className="mt-2 hidden rounded-full bg-gc-coral px-4 py-3 text-center font-semibold text-white sm:block"
                    >
                      Agendar atendimento
                    </a>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className={cn(HEADER_HEIGHT, 'pointer-events-none')} aria-hidden />
    </>
  );
}
