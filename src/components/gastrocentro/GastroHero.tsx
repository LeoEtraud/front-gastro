import { Link } from 'react-router-dom';
import { Award, Microscope, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function GastroHero() {
  return (
    <section
      id="topo"
      className="relative overflow-hidden border-b border-cyan-900/10 bg-gradient-to-b from-cyan-50 via-white to-slate-50 pb-16 pt-10 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 top-0 h-[28rem] w-[28rem] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-[22rem] w-[22rem] rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1600px] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-10">
        <div className="text-center lg:col-span-7 lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/80 px-3 py-1.5 text-sm font-semibold text-cyan-900 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-600" aria-hidden />
            Plataforma de conteúdo clínico Gastrocentro
          </div>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Conhecimento, cuidado e inovação em{' '}
            <span className="bg-gradient-to-r from-cyan-700 to-cyan-950 bg-clip-text text-transparent">saúde digestiva</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
            Acesse trilhas em vídeo, materiais complementares e atualizações pensadas para médicos, equipes de saúde e
            pacientes informados — com a mesma excelência clínica da Gastrocentro.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:justify-start lg:mt-10">
            <Link
              to="/register"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 w-full rounded-full border-0 bg-gradient-to-r from-cyan-600 to-cyan-800 px-8 text-base font-semibold text-white shadow-xl shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-cyan-700 hover:shadow-cyan-900/40 sm:w-auto sm:min-w-[11.5rem] sm:text-lg',
              )}
            >
              Começar agora
            </Link>
            <a
              href="#especialidades"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 w-full rounded-full border-2 border-cyan-700/40 bg-gradient-to-b from-white via-white to-cyan-50/90 px-8 text-base font-semibold text-cyan-950 shadow-md shadow-cyan-900/10 ring-1 ring-cyan-900/5 backdrop-blur-sm transition hover:border-cyan-600 hover:bg-gradient-to-b hover:from-cyan-50 hover:via-white hover:to-cyan-50/80 hover:shadow-lg hover:shadow-cyan-900/15 sm:w-auto sm:min-w-[11.5rem] sm:text-lg',
              )}
            >
              Conhecer especialidades
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-left text-xs text-slate-700 shadow-sm backdrop-blur-sm sm:text-sm">
              <Award className="h-5 w-5 shrink-0 text-cyan-600" aria-hidden />
              <span>
                <span className="block font-bold text-slate-900">Tradição e acolhimento</span>
                <span className="text-slate-600">Mais de três décadas cuidando do aparelho digestivo em São Luís.</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-left text-xs text-slate-700 shadow-sm backdrop-blur-sm sm:text-sm">
              <Microscope className="h-5 w-5 shrink-0 text-cyan-600" aria-hidden />
              <span>
                <span className="block font-bold text-slate-900">Autoridade clínica</span>
                <span className="text-slate-600">Conteúdo revisado por especialistas da equipe Gastrocentro.</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-900/10 bg-white shadow-xl shadow-cyan-900/10">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=960&q=80"
              alt="Ambiente clínico moderno"
              loading="eager"
              decoding="async"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/30 via-transparent to-transparent" aria-hidden />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/30 bg-white/90 p-4 text-sm shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:p-5">
              <p className="font-display text-base font-bold text-cyan-950 sm:text-lg">Gastrocentro</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Centro médico especializado no diagnóstico e tratamento das doenças do aparelho digestivo e da obesidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
