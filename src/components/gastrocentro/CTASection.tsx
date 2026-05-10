import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CTASection() {
  return (
    <section className="border-y border-cyan-900/10 bg-gradient-to-r from-cyan-800 via-cyan-900 to-slate-900 py-14 text-white sm:py-16">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-6 px-4 text-center sm:px-6 lg:flex-row lg:justify-between lg:gap-10 lg:px-10 lg:text-left">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200/90">Próximo passo</p>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Agende sua consulta ou explore o conteúdo</h2>
          <p className="mt-3 text-sm leading-relaxed text-cyan-50/90 sm:text-base">
            Unimos cuidado presencial e educação digital. Fale com a equipe ou entre na plataforma para continuar de onde parou.
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center lg:w-auto lg:max-w-none lg:flex-col lg:items-stretch">
          <a href="https://gastrocentroslz.com.br/" className="w-full sm:w-auto lg:w-full">
            <Button
              size="lg"
              className="h-12 w-full rounded-xl border-0 bg-white font-semibold text-cyan-900 shadow-lg hover:bg-cyan-50"
            >
              Agendar atendimento
            </Button>
          </a>
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'h-12 w-full rounded-xl border-2 border-white/55 bg-white/10 font-semibold text-white shadow-md backdrop-blur-md transition-all hover:border-cyan-100/90 hover:bg-white/20 hover:text-white hover:shadow-lg sm:w-auto lg:w-full',
            )}
          >
            Acessar plataforma
          </Link>
        </div>
      </div>
    </section>
  );
}
