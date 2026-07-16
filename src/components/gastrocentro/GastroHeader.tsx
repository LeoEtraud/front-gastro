import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GastroButton } from '@/components/gastrocentro/GastroButton';
import {
  GASTRO_ABOUT_URL,
  GASTRO_SCROLL_OFFSET_PX,
  gastroNavItems,
  handleGastroAnchorClick,
  type GastroNavItem,
} from '@/components/gastrocentro/gastro-nav';
import { cn } from '@/lib/utils';

const HEADER_HEIGHT = 'h-[88px]';

function useActiveGastroSection() {
  const [activeHref, setActiveHref] = useState<string>(gastroNavItems[0]?.href ?? '#topo');

  useEffect(() => {
    const sectionIds = gastroNavItems.map((item) => item.href.slice(1));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const resolveActive = () => {
      const marker = window.scrollY + GASTRO_SCROLL_OFFSET_PX;
      let current = gastroNavItems[0]?.href ?? '#topo';

      for (const el of elements) {
        const paddingTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
        const contentTop = el.offsetTop + paddingTop;
        if (contentTop <= marker) {
          current = `#${el.id}`;
        }
      }

      // No fim da página, prioriza a última seção (contato)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = gastroNavItems[gastroNavItems.length - 1]?.href ?? current;
      }

      setActiveHref(current);
    };

    resolveActive();
    window.addEventListener('scroll', resolveActive, { passive: true });
    window.addEventListener('resize', resolveActive);
    return () => {
      window.removeEventListener('scroll', resolveActive);
      window.removeEventListener('resize', resolveActive);
    };
  }, []);

  return activeHref;
}

function NavLink({
  item,
  active,
  onNavigate,
  className,
}: {
  item: GastroNavItem;
  active?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const short = 'shortLabel' in item ? item.shortLabel : undefined;

  return (
    <a
      href={item.href}
      onClick={(e) => handleGastroAnchorClick(e, item.href, onNavigate)}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group relative whitespace-nowrap px-2.5 py-2 text-[13px] font-semibold transition-colors duration-150 xl:px-3',
        active ? 'text-white' : 'text-white/85 hover:text-white',
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
      {/* Underline — mesmo do hover, permanente quando a seção está ativa */}
      <span
        className={cn(
          'absolute inset-x-2.5 bottom-0 h-[2px] origin-left rounded-full bg-gc-teal transition-transform duration-200 xl:inset-x-3',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
        aria-hidden
      />
    </a>
  );
}

export function GastroHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeHref = useActiveGastroSection();

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
            ? 'border-white/10 bg-gc-navy/88 shadow-[0_4px_28px_rgba(0,0,0,0.22)] backdrop-blur-md'
            : 'border-transparent bg-gc-navy/97 backdrop-blur-sm',
        )}
      >
        <div
          className={cn(
            'mx-auto grid w-full max-w-[100%] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8 xl:px-10',
            HEADER_HEIGHT,
          )}
        >
          {/* Logo */}
          <a
            href="#topo"
            onClick={(e) => handleGastroAnchorClick(e, '#topo')}
            className="flex min-w-0 shrink-0 items-center justify-self-start"
          >
            <img
              src="/logo-menu.png"
              alt="GastroCentro"
              className="h-[4.5rem] w-auto max-w-[min(75vw,20rem)] object-contain object-left sm:h-[4.75rem] lg:h-20 lg:max-w-[26rem]"
            />
          </a>

          {/* Navigation — center (desktop) */}
          <nav
            className="hidden min-w-0 items-center justify-center gap-0 lg:flex xl:gap-0.5"
            aria-label="Principal"
          >
            {gastroNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={activeHref === item.href} />
            ))}
          </nav>

          {/* Actions — right */}
          <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2 lg:gap-3">
            <div className="hidden items-center gap-3 lg:flex xl:gap-3.5">
              <GastroButton
                href="/login"
                variant="primary"
                className="h-[42px] whitespace-nowrap px-5 text-[13px] font-semibold xl:px-6"
              >
                Entrar na plataforma
              </GastroButton>
              <GastroButton
                href={GASTRO_ABOUT_URL}
                variant="secondary"
                className="h-[42px] whitespace-nowrap px-5 text-[13px] font-semibold xl:px-6"
              >
                Conheça a clínica
              </GastroButton>
            </div>

            {/* Mobile / tablet */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
              <GastroButton
                href="/login"
                variant="primary"
                className="hidden h-9 px-3 text-xs sm:inline-flex sm:h-10 sm:px-4 sm:text-[13px]"
              >
                Entrar na plataforma
              </GastroButton>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl text-white hover:bg-white/10"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="gc-font w-[min(100vw-1rem,22rem)] border-gc-mid bg-gc-navy text-white">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-white">Navegação</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1" aria-label="Principal">
                    {gastroNavItems.map((item) => {
                      const active = activeHref === item.href;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleGastroAnchorClick(e, item.href, closeMobileMenu)}
                          aria-current={active ? 'true' : undefined}
                          className={cn(
                            'rounded-xl px-4 py-3 text-[14px] font-semibold transition-colors duration-150',
                            active
                              ? 'bg-white/10 text-white'
                              : 'text-white/80 hover:bg-white/10 hover:text-white',
                          )}
                        >
                          {item.label}
                        </a>
                      );
                    })}
                    <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-5">
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#FF6A2A_0%,#FF8745_100%)] px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,42,0.30)] transition-all duration-200 hover:bg-[#FF5416] hover:[background-image:none]"
                      >
                        Entrar na plataforma
                      </Link>
                      <a
                        href={GASTRO_ABOUT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMobileMenu}
                        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/35 bg-transparent px-6 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/[0.08]"
                      >
                        Conheça a clínica
                      </a>
                    </div>
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
