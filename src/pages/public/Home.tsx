import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Menu,
  PlayCircle,
  Route,
  ShieldCheck,
  Stethoscope,
  Target,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-slate-900 selection:bg-primary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 font-display text-lg font-bold text-primary sm:text-2xl">
            <BookOpen className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" aria-hidden />
            <span className="truncate">MedLearn</span>
          </div>

          <div className="hidden items-center gap-2 md:flex md:gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                className="font-semibold text-blue-800 hover:bg-blue-600/12 hover:text-blue-900 focus-visible:ring-blue-600/40"
              >
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/30 hover:from-blue-600 hover:to-blue-800">
                Criar Conta
              </Button>
            </Link>
          </div>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-6 w-6" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(100vw-1rem,20rem)] flex-col gap-6">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                  <span className="block min-h-11 rounded-xl border border-blue-700/35 bg-blue-600/10 px-3 py-3 text-center text-base font-semibold text-blue-900 shadow-sm shadow-blue-900/15 backdrop-blur-sm transition-colors hover:border-blue-800/55 hover:bg-blue-600/15 hover:shadow-blue-900/20 touch-manipulation">
                    Entrar
                  </span>
                </Link>
                <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                  <Button
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/30 hover:from-blue-600 hover:to-blue-800 transition-all"
                    size="lg"
                  >
                    Criar Conta
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-20 md:pb-28">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            className="h-full w-full object-cover opacity-10 saturate-120"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white" />

          <div className="absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-700/12 blur-3xl" />
          <div className="absolute -left-24 top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 top-56 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:gap-12 lg:grid-cols-12">
            <div className="text-center lg:col-span-6 lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-800/15 bg-gradient-to-r from-primary/10 via-blue-700/10 to-sky-500/10 px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm sm:mb-6">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-800" aria-hidden />
                Plataforma EAD Premium
              </div>

              <h1 className="mb-5 max-w-4xl font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
                Excelência em{' '}
                <span className="bg-gradient-to-r from-primary via-blue-700 to-blue-900 bg-clip-text text-transparent">
                  Educação Médica
                </span>{' '}
                Continuada
              </h1>

              <p className="mb-7 max-w-2xl text-base leading-relaxed text-slate-600 sm:mb-10 sm:text-lg md:text-xl">
                Aprenda com os melhores especialistas. Cursos de alto nível, atualizados e focados na prática clínica
                para estudantes e profissionais de medicina.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 text-base shadow-xl shadow-blue-900/30 transition-all hover:from-blue-600 hover:to-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600/45 sm:h-14 sm:px-8 sm:text-lg"
                  >
                    Começar a Estudar <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
                  </Button>
                </Link>

                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-blue-700/40 bg-blue-600/10 px-6 text-base font-semibold text-blue-900 shadow-md shadow-blue-900/15 backdrop-blur-sm transition-all hover:border-blue-800/55 hover:bg-blue-600/18 hover:text-blue-950 hover:shadow-lg hover:shadow-blue-900/25 focus-visible:ring-2 focus-visible:ring-blue-600/45 sm:h-14 sm:px-8 sm:text-lg"
                  >
                    Entrar
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-sm">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Conteudo atualizado
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-sm">
                  <Users className="h-3.5 w-3.5 text-blue-800" aria-hidden />
                  Especialistas qualificados
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-sm">
                  <Target className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                  Foco na prática clínica
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 shadow-md">
                <img
                  src={`${import.meta.env.BASE_URL}img-page-home.jpg`}
                  alt="Plataforma de cursos premium"
                  className="h-full min-h-[24rem] w-full object-cover object-center lg:min-h-[38rem]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-900/18 via-transparent to-primary/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative overflow-hidden border-t bg-slate-50 py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <img
            src={`${import.meta.env.BASE_URL}images/doctor-abstract.png`}
            alt=""
            className="h-full w-full object-contain object-center opacity-[0.32] saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/86 via-slate-50/72 to-slate-50/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.10] via-transparent to-blue-900/[0.08]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Um jeito premium de estudar medicina
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:mt-4 sm:text-base">
              Conteúdo médico atualizado, trilhas guiadas e foco na prática clínica - para evoluir com clareza e
              consistência.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {[
              {
                icon: PlayCircle,
                title: 'Aulas em vídeo de alta precisão',
                desc: 'Demonstrações clínicas e casos reais, com linguagem clara e objetiva.',
              },
              {
                icon: Stethoscope,
                title: 'Conteúdo médico atualizado',
                desc: 'Revisões e materiais alinhados à prática e às melhores evidências.',
              },
              {
                icon: Route,
                title: 'Trilhas de aprendizado guiadas',
                desc: 'Roteiro organizado por objetivos para você estudar com direção.',
              },
              {
                icon: Users,
                title: 'Especialistas qualificados',
                desc: 'Professores que são referências nas suas áreas de atuação.',
              },
              {
                icon: Clock3,
                title: 'Acesso flexível',
                desc: 'Estude no seu ritmo com navegação rápida e acompanhamento do progresso.',
              },
              {
                icon: Target,
                title: 'Foco na prática clínica',
                desc: 'Treinamento pensado para decisões e condutas no dia a dia.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-[2px] transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-blue-800/0 to-sky-500/0 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/12 via-blue-700/12 to-transparent ring-1 ring-blue-800/15 sm:mb-6">
                    <feature.icon className="h-7 w-7 text-primary" aria-hidden />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-12">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 px-5 py-6 shadow-sm backdrop-blur-sm sm:px-8 sm:py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/12 via-blue-800/12 to-sky-500/10" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-primary">Comece sua jornada hoje</div>
                  <div className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                    Crie sua conta e evolua com clareza, consistência e foco na prática clínica.
                  </div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">
                    Navegue com facilidade, estude com foco e mantenha consistência do começo ao fim.
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/25 hover:from-blue-600 hover:to-blue-800 sm:w-auto sm:px-8"
                    >
                      Começar agora
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-xl border-blue-700/40 bg-blue-600/10 font-semibold text-blue-900 shadow-md shadow-blue-900/15 backdrop-blur-sm transition-all hover:border-blue-800/55 hover:bg-blue-600/18 hover:text-blue-950 hover:shadow-lg hover:shadow-blue-900/25 sm:w-auto sm:px-8"
                    >
                      Já tenho conta
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-slate-400 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white sm:text-xl">
            <BookOpen className="h-6 w-6 shrink-0 text-primary" aria-hidden /> MedLearn
          </div>
          <p className="text-center text-xs sm:text-sm">© {new Date().getFullYear()} MedLearn Plataforma EAD. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
