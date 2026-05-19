import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GastroButton } from '@/components/gastrocentro/GastroButton';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Início', href: '#topo' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Médicos', href: '#especialistas' },
  { label: 'Cursos e Conteúdos', shortLabel: 'Cursos', href: '#cursos-destaque' },
  { label: 'Agenda', href: '#comece-aqui' },
  { label: 'Contato', href: '#contato' },
] as const;

function NavLink({ item }: { item: (typeof nav)[number] }) {
  const short = 'shortLabel' in item ? item.shortLabel : undefined;
  return (
    <a
      href={item.href}
      className="whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium text-white/75 transition hover:bg-white/5 hover:text-white xl:px-3"
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

  return (
    <header
      className={cn(
        'gc-font sticky top-0 z-50 w-full bg-gc-navy transition-shadow duration-300',
        scrolled && 'shadow-[0_4px_24px_rgba(0,0,0,0.25)]',
      )}
    >
      <GastroSection className="!py-0">
        <GastroContainer className="flex h-[72px] min-w-0 items-center justify-between gap-4">
          {/* Logo */}
          <a href="#topo" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gc-teal to-gc-coral">
              <Activity className="h-[18px] w-[18px] text-white" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">GastroCentro</span>
          </a>

          {/* Desktop: navegação + ações */}
          <div className="hidden min-w-0 flex-1 items-center justify-end gap-6 lg:flex xl:gap-10">
            <nav className="flex min-w-0 flex-wrap items-center justify-end gap-0.5 xl:gap-1" aria-label="Principal">
              {nav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-3 border-l border-white/15 pl-6 xl:pl-8">
              <GastroButton href="/login" variant="secondary" className="h-10 whitespace-nowrap px-4 text-[13px] xl:px-5">
                Acessar plataforma
              </GastroButton>
              <GastroButton href="/register" variant="primary" className="h-10 whitespace-nowrap px-4 text-[13px] xl:px-5">
                Agendar atendimento
              </GastroButton>
            </div>
          </div>

          {/* Mobile / tablet compacto */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <GastroButton href="/register" variant="primary" className="h-9 px-4 text-xs sm:h-10 sm:text-[13px]">
              Agendar
            </GastroButton>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Abrir menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="gc-font w-[min(100vw-1rem,22rem)] bg-gc-ice">
                <SheetHeader className="text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {nav.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 font-medium text-gc-text hover:bg-gc-border/60"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mt-4 rounded-full border border-gc-border px-4 py-3 text-center font-semibold text-gc-text"
                  >
                    Acessar plataforma
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-full bg-gc-coral px-4 py-3 text-center font-semibold text-white"
                  >
                    Agendar atendimento
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </GastroContainer>
      </GastroSection>
    </header>
  );
}
