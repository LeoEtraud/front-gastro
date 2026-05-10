import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function GastroFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 text-slate-600">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-cyan-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-800 text-white">
              <Activity className="h-5 w-5" aria-hidden />
            </span>
            Gastrocentro
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Excelência em saúde digestiva e obesidade. Conteúdo educativo para apoiar pacientes e profissionais de saúde.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Navegação</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-cyan-800" href="#topo">
                Início
              </a>
            </li>
            <li>
              <a className="hover:text-cyan-800" href="#especialidades">
                Especialidades
              </a>
            </li>
            <li>
              <a className="hover:text-cyan-800" href="#equipe">
                Médicos
              </a>
            </li>
            <li>
              <a className="hover:text-cyan-800" href="#destaques">
                Conteúdos
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Institucional</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-cyan-800" href="https://gastrocentroslz.com.br/">
                Site Gastrocentro
              </a>
            </li>
            <li>
              <a className="hover:text-cyan-800" href="https://gastrocentroslz.com.br/contato">
                Contato
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Plataforma</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-cyan-800" to="/login">
                Entrar
              </Link>
            </li>
            <li>
              <Link className="hover:text-cyan-800" to="/register">
                Criar conta
              </Link>
            </li>
            <li>
              <Link className="hover:text-cyan-800" to="/">
                MedLearn (home)
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1600px] border-t border-slate-200 px-4 pt-8 text-center text-xs text-slate-500 sm:px-6 lg:px-10">
        © {new Date().getFullYear()} Gastrocentro — Conteúdo meramente educativo. Não substitui avaliação médica presencial.
      </div>
    </footer>
  );
}
