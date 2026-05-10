import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const nav = [
  { label: 'Início', href: '#topo' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Médicos', href: '#equipe' },
  { label: 'Cursos / Conteúdos', href: '#destaques' },
  { label: 'Agendamento', href: 'https://gastrocentroslz.com.br/' },
  { label: 'Contato', href: 'https://gastrocentroslz.com.br/contato' },
] as const;

export function GastroHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/10 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
        <a href="#topo" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 text-white shadow-md shadow-cyan-900/20 sm:h-10 sm:w-10">
            <Activity className="h-5 w-5 sm:h-5 sm:w-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-cyan-950 sm:text-xl">Gastrocentro</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {nav.map((item) => (
            <a
              key={item.href + item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'shrink-0 rounded-xl border-2 border-cyan-800/25 bg-white/95 font-semibold text-cyan-950 shadow-sm backdrop-blur-sm transition-all hover:border-cyan-600 hover:bg-cyan-50 hover:text-cyan-950 hover:shadow-md hover:shadow-cyan-900/15 focus-visible:ring-cyan-600',
            )}
          >
            Acessar plataforma
          </Link>
          <a href="https://gastrocentroslz.com.br/">
            <Button className="rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-800 font-semibold text-white shadow-lg shadow-cyan-900/25 hover:from-cyan-500 hover:to-cyan-700">
              Agendar atendimento
            </Button>
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a href="https://gastrocentroslz.com.br/">
            <Button size="sm" className="rounded-lg bg-cyan-700 text-white hover:bg-cyan-800">
              Agendar
            </Button>
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(100vw-1rem,22rem)] flex-col gap-6">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {nav.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-cyan-50"
                  >
                    {item.label}
                  </a>
                ))}
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'default' }),
                    'mt-2 w-full rounded-xl border-2 border-cyan-800/25 bg-white font-semibold text-cyan-950 shadow-sm transition-all hover:border-cyan-600 hover:bg-cyan-50 hover:shadow-md',
                  )}
                >
                  Acessar plataforma
                </Link>
                <a href="https://gastrocentroslz.com.br/" onClick={() => setOpen(false)}>
                  <Button className="mt-2 w-full bg-cyan-700 hover:bg-cyan-800">Agendar atendimento</Button>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
