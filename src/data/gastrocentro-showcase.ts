/** Conteúdo editorial da vitrine Gastrocentro — substitua `imageSrc` por fotos institucionais quando disponíveis. */
export type ShowcaseCard = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  /** URL absoluta de imagem (otimizada no CDN de origem). */
  imageSrc: string;
  href: string;
};

export type ShowcaseSection = {
  id: string;
  title: string;
  description?: string;
  cards: ShowcaseCard[];
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const gastrocentroShowcaseSections: ShowcaseSection[] = [
  {
    id: 'comece-aqui',
    title: 'Comece por aqui',
    description: 'Orientações rápidas para navegar na plataforma e aproveitar o conteúdo clínico.',
    cards: [
      {
        id: 'boas-vindas',
        title: 'Boas-vindas à plataforma',
        subtitle: 'Entenda como a Gastrocentro organiza cursos, materiais e atualizações.',
        category: 'Introdução',
        imageSrc: img('photo-1576091160550-2173dba999ef'),
        href: '/login',
      },
      {
        id: 'navegar',
        title: 'Como navegar no conteúdo',
        subtitle: 'Trilhas por especialidade, busca e favoritos para estudar no seu ritmo.',
        category: 'Guia',
        imageSrc: img('photo-1516549655169-df83a0774514'),
        href: '/login',
      },
      {
        id: 'materiais',
        title: 'Material complementar',
        subtitle: 'PDFs, resumos e referências alinhadas às aulas em vídeo.',
        category: 'Recursos',
        imageSrc: img('photo-1454165804606-c3d57bc86b40'),
        href: '/login',
      },
    ],
  },
  {
    id: 'especialidades',
    title: 'Especialidades Gastrocentro',
    description: 'Conteúdo clínico alinhado às linhas de cuidado da clínica em São Luís.',
    cards: [
      {
        id: 'gastro',
        title: 'Gastroenterologia',
        subtitle: 'Doenças do trato digestivo, diagnóstico e condutas baseadas em evidência.',
        category: 'Especialidade',
        imageSrc: img('photo-1582719478250-c89cae4dc85b'),
        href: '/login',
      },
      {
        id: 'hepato',
        title: 'Hepatologia',
        subtitle: 'Fígado, vias biliares e acompanhamento de doenças hepáticas.',
        category: 'Especialidade',
        imageSrc: img('photo-1559757148-5c350d0d3c56'),
        href: '/login',
      },
      {
        id: 'colo',
        title: 'Coloproctologia',
        subtitle: 'Intestino grosso, reto e ânus: abordagem clínica e cirúrgica.',
        category: 'Especialidade',
        imageSrc: img('photo-1579684385127-1ef15d5081de'),
        href: '/login',
      },
      {
        id: 'cir-digest',
        title: 'Cirurgia do aparelho digestivo',
        subtitle: 'Procedimentos e cuidados perioperatórios em digestivo.',
        category: 'Cirurgia',
        imageSrc: img('photo-1519494026892-80bbd2d6fd0d'),
        href: '/login',
      },
      {
        id: 'bariatrica',
        title: 'Cirurgia da obesidade',
        subtitle: 'Multidisciplinaridade, acompanhamento e segurança no tratamento.',
        category: 'Cirurgia',
        imageSrc: img('photo-1571019613454-1cb2f99b2d8b'),
        href: '/login',
      },
      {
        id: 'nutri',
        title: 'Nutrição',
        subtitle: 'Estratégias dietéticas no contexto digestivo e metabólico.',
        category: 'Apoio',
        imageSrc: img('photo-1490645935967-10de6ba17061'),
        href: '/login',
      },
      {
        id: 'psico',
        title: 'Psicologia',
        subtitle: 'Acolhimento e suporte no cuidado integrado ao paciente.',
        category: 'Apoio',
        imageSrc: img('photo-1573497019940-1c28c88b4f3e'),
        href: '/login',
      },
    ],
  },
  {
    id: 'destaques',
    title: 'Conteúdos em destaque',
    cards: [
      {
        id: 'endoscopia',
        title: 'Endoscopia digestiva',
        subtitle: 'Indicações, preparo e interpretação em linguagem acessível.',
        category: 'Procedimento',
        imageSrc: img('photo-1584982751601-97dcc096659c'),
        href: '/login',
      },
      {
        id: 'prevencao',
        title: 'Prevenção do câncer intestinal',
        subtitle: 'Rastreamento, fatores de risco e importância do acompanhamento.',
        category: 'Prevenção',
        imageSrc: img('photo-1551601651-2a8555f1a136'),
        href: '/login',
      },
      {
        id: 'figado',
        title: 'Saúde do fígado',
        subtitle: 'Esteatose, hepatites e estilo de vida: o que o paciente precisa saber.',
        category: 'Educação',
        imageSrc: img('photo-1628597465204-d94b5a0e9e70'),
        href: '/login',
      },
    ],
  },
  {
    id: 'procedimentos',
    title: 'Procedimentos e exames',
    cards: [
      {
        id: 'pylori',
        title: 'H. pylori',
        subtitle: 'Diagnóstico, tratamento e seguimento na prática ambulatorial.',
        category: 'Tema clínico',
        imageSrc: img('photo-1587854692152-cbe660dbde88'),
        href: '/login',
      },
      {
        id: 'refluxo',
        title: 'Refluxo e gastrite',
        subtitle: 'Diferenciação sintomática e condutas terapêuticas.',
        category: 'Tema clínico',
        imageSrc: img('photo-1505751172876-fa1923c5c528'),
        href: '/login',
      },
      {
        id: 'colonoscopia',
        title: 'Colonoscopia e preparo',
        subtitle: 'Orientações ao paciente e boas práticas de segurança.',
        category: 'Exame',
        imageSrc: img('photo-1551190822-a9333d879079'),
        href: '/login',
      },
    ],
  },
  {
    id: 'equipe',
    title: 'Equipe médica',
    description: 'Conheça os especialistas que assinam o conteúdo clínico da plataforma.',
    cards: [
      {
        id: 'medicos',
        title: 'Corpo clínico',
        subtitle: 'Gastroenterologistas, cirurgiões e equipe multidisciplinar.',
        category: 'Institucional',
        imageSrc: img('photo-1612349317150-e413f6a5b16d'),
        href: '/login',
      },
      {
        id: 'tele',
        title: 'Telemedicina e conteúdo',
        subtitle: 'Como a Gastrocentro une presença física e educação à distância.',
        category: 'Inovação',
        imageSrc: img('photo-1576091160399-112ba8d25d1d'),
        href: '/login',
      },
    ],
  },
  {
    id: 'digestao-prevencao',
    title: 'Saúde digestiva e prevenção',
    cards: [
      {
        id: 'alimentacao',
        title: 'Alimentação consciente',
        subtitle: 'Hábitos que favorecem o bem-estar digestivo no dia a dia.',
        category: 'Prevenção',
        imageSrc: img('photo-1498837167922-ddd27525d352'),
        href: '/login',
      },
      {
        id: 'checkup',
        title: 'Check-up digestivo',
        subtitle: 'Quando procurar o especialista e quais exames considerar.',
        category: 'Prevenção',
        imageSrc: img('photo-1576091160444-42d5b5424ede'),
        href: '/login',
      },
    ],
  },
  {
    id: 'mais-acessados',
    title: 'Mais acessados',
    cards: [
      {
        id: 'eap',
        title: 'Edema agudo de pulmão',
        subtitle: 'Conduta inicial e integração com emergência.',
        category: 'Emergência',
        imageSrc: img('photo-1530497610728-7e399052a590'),
        href: '/login',
      },
      {
        id: 'constipacao',
        title: 'Constipação funcional',
        subtitle: 'Avaliação, critérios e abordagem ambulatorial.',
        category: 'Ambulatório',
        imageSrc: img('photo-1559757175-0eb30cd8c063'),
        href: '/login',
      },
      {
        id: 'diarreia',
        title: 'Diarreia aguda',
        subtitle: 'Hidratação, sinais de alarme e encaminhamento.',
        category: 'Ambulatório',
        imageSrc: img('photo-1584036561562-baf8f0f1b144'),
        href: '/login',
      },
    ],
  },
];
