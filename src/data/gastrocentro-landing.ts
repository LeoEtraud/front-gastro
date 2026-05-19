/** Conteúdo editorial da landing GastroCentro — imagens via [Unsplash](https://unsplash.com/pt-br). */

const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** IDs verificados no Unsplash Source (images.unsplash.com). */
const unsplash = {
  endoscopyEquipment: 'photo-1582719478250-c89cae4dc85b',
  stethoscope: 'photo-1584982751601-97dcc096659c',
  liverAnatomy: 'photo-1715529282042-75cc2f360a73',
  digestiveIllustration: 'photo-1649073586428-e288125d930a',
  medicalStethoscope: 'photo-1505751172876-fa1923c5c528',
  healthyFood: 'photo-1490645935967-10de6ba17061',
  hospitalIv: 'photo-1774456566976-73ffc4527173',
  pediatricCare: 'photo-1576091160550-2173dba999ef',
  emergencyRoom: 'photo-1723513198534-c3cd2e033815',
  cprTraining: 'photo-1572996489045-96ed977a73b4',
  hospitalIcu: 'photo-1519494026892-80bbd2d6fd0d',
  surgeryTeam: 'photo-1551601651-2a8555f1a136',
  medicalPills: 'photo-1587854692152-cbe660dbde88',
  doctorPortrait: 'photo-1612349317150-e413f6a5b16d',
  doctorFemale: 'photo-1559839734-2b71ea197ec2',
  doctorMale: 'photo-1622253692010-333f2da6031d',
  clinicalTeam: 'photo-1576091160399-112ba8d25d1d',
  medicalResearch: 'photo-1454165804606-c3d57bc86b40',
  brainScan: 'photo-1559757148-5c350d0d3c56',
  medicalSupplies: 'photo-1643660527074-0ddcec3bda96',
} as const;

export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  primaryHref: string;
  secondaryHref: string;
  imageSrc: string;
  imageAlt: string;
};

export type ShowcaseThumb = {
  id: string;
  title: string;
  category: string;
  imageSrc: string;
  href: string;
};

export type StartHereCard = {
  id: string;
  title: string;
  description: string;
  icon: 'routes' | 'star' | 'files' | 'calendar';
  href: string;
};

export type Specialty = {
  id: string;
  name: string;
  count: number;
  imageSrc: string;
};

export type FeaturedCourse = {
  id: string;
  title: string;
  category: string;
  badge?: string;
  imageSrc: string;
};

export type Specialist = {
  id: string;
  name: string;
  specialty: string;
  registration: string;
  initials: string;
  color: string;
  photoSrc?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export type Benefit = {
  id: string;
  title: string;
  description: string;
  icon: 'refresh' | 'clock' | 'headset' | 'award';
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    badge: 'Novo curso',
    title: 'Domine técnicas essenciais em saúde digestiva',
    subtitle:
      'Aulas práticas, materiais complementares e conteúdos atualizados para sua evolução clínica.',
    primaryCta: 'Assistir agora',
    secondaryCta: 'Ver especialidades',
    primaryHref: '/login',
    secondaryHref: '#especialidades',
    imageSrc: img('photo-1576091160399-112ba8d25d1d'),
    imageAlt: 'Profissionais de saúde em ambiente clínico moderno',
  },
  {
    id: 'slide-2',
    badge: 'Trilhas completas',
    title: 'Aprenda por especialidades',
    subtitle: 'Conteúdos organizados em Endoscopia, Hepatologia, Nutrição, Pediatria e muito mais.',
    primaryCta: 'Explorar trilhas',
    secondaryCta: 'Conhecer plataforma',
    primaryHref: '/login',
    secondaryHref: '#topo',
    imageSrc: img('photo-1582719478250-c89cae4dc85b'),
    imageAlt: 'Equipamento médico de endoscopia digestiva',
  },
  {
    id: 'slide-3',
    badge: 'Especialistas',
    title: 'Aulas com profissionais referência',
    subtitle: 'Conteúdos conduzidos por especialistas experientes e reconhecidos na prática clínica.',
    primaryCta: 'Conhecer especialistas',
    secondaryCta: 'Ver cursos',
    primaryHref: '#especialistas',
    secondaryHref: '#cursos-destaque',
    imageSrc: img('photo-1612349317150-e413f6a5b16d'),
    imageAlt: 'Médico especialista em consulta',
  },
  {
    id: 'slide-4',
    badge: 'Certificação',
    title: 'Evolua sua carreira com conteúdos certificados',
    subtitle: 'Conclua cursos, acompanhe seu progresso e fortaleça sua formação profissional.',
    primaryCta: 'Ver certificações',
    secondaryCta: 'Começar agora',
    primaryHref: '/register',
    secondaryHref: '/register',
    imageSrc: img('photo-1454165804606-c3d57bc86b40'),
    imageAlt: 'Profissional estudando materiais clínicos',
  },
];

export const showcaseThumbs: ShowcaseThumb[] = [
  {
    id: 'thumb-1',
    title: 'Técnicas em APH',
    category: 'Urgência',
    imageSrc: img(unsplash.emergencyRoom, 600),
    href: '/login',
  },
  {
    id: 'thumb-2',
    title: 'Endoscopia Avançada',
    category: 'Procedimentos',
    imageSrc: img(unsplash.endoscopyEquipment, 600),
    href: '/login',
  },
  {
    id: 'thumb-3',
    title: 'Hepatologia Clínica',
    category: 'Especialidade',
    imageSrc: img('photo-1559757148-5c350d0d3c56', 600),
    href: '/login',
  },
  {
    id: 'thumb-4',
    title: 'Nutrição Digestiva',
    category: 'Nutrição',
    imageSrc: img('photo-1490645935967-10de6ba17061', 600),
    href: '/login',
  },
  {
    id: 'thumb-5',
    title: 'Via Aérea e Ventilação',
    category: 'Emergências',
    imageSrc: img('photo-1519494026892-80bbd2d6fd0d', 600),
    href: '/login',
  },
  {
    id: 'thumb-6',
    title: 'Colonoscopia e Preparo',
    category: 'Exames',
    imageSrc: img(unsplash.endoscopyEquipment, 600),
    href: '/login',
  },
];

export const stats = [
  { id: 'students', value: '+5 mil', label: 'Alunos ativos', icon: 'users' as const },
  { id: 'lessons', value: '+200', label: 'Aulas disponíveis', icon: 'play' as const },
  { id: 'specialties', value: '24', label: 'Especialidades', icon: 'layers' as const },
  { id: 'satisfaction', value: '98%', label: 'Satisfação dos alunos', icon: 'heart' as const },
];

export const startHereCards: StartHereCard[] = [
  {
    id: 'trilhas',
    title: 'Trilhas de aprendizado',
    description: 'Jornadas organizadas por nível e tema.',
    icon: 'routes',
    href: '/login',
  },
  {
    id: 'destaques',
    title: 'Aulas em destaque',
    description: 'Seleção dos conteúdos mais acessados.',
    icon: 'star',
    href: '#cursos-destaque',
  },
  {
    id: 'materiais',
    title: 'Materiais complementares',
    description: 'Artigos, guias e downloads exclusivos.',
    icon: 'files',
    href: '/login',
  },
  {
    id: 'lives',
    title: 'Agenda de lives',
    description: 'Eventos ao vivo com especialistas.',
    icon: 'calendar',
    href: '/login',
  },
];

export const specialties: Specialty[] = [
  { id: 'endo', name: 'Endoscopia', count: 26, imageSrc: img(unsplash.endoscopyEquipment, 800) },
  { id: 'hepato', name: 'Hepatologia', count: 24, imageSrc: img(unsplash.liverAnatomy, 800) },
  { id: 'motil', name: 'Motilidade', count: 18, imageSrc: img(unsplash.digestiveIllustration, 800) },
  { id: 'nutri', name: 'Nutrição', count: 22, imageSrc: img(unsplash.healthyFood, 800) },
  { id: 'onco', name: 'Oncologia', count: 30, imageSrc: img(unsplash.hospitalIv, 800) },
  { id: 'ped', name: 'Pediatria', count: 16, imageSrc: img(unsplash.pediatricCare, 800) },
];

export const featuredCourses: FeaturedCourse[] = [
  {
    id: 'aph',
    title: 'Técnicas em APH',
    category: 'Urgência',
    badge: 'Mais assistido',
    imageSrc: img(unsplash.cprTraining, 900),
  },
  {
    id: 'injecoes',
    title: 'Aplicação de Injeções',
    category: 'Procedimentos',
    imageSrc: img('photo-1587854692152-cbe660dbde88', 900),
  },
  {
    id: 'perfusao',
    title: 'Perfusão Extracorpórea',
    category: 'Terapia Intensiva',
    imageSrc: img('photo-1519494026892-80bbd2d6fd0d', 900),
  },
  {
    id: 'via-aerea',
    title: 'Via Aérea e Ventilação',
    category: 'Emergências',
    imageSrc: img('photo-1551601651-2a8555f1a136', 900),
  },
];

export const specialists: Specialist[] = [
  {
    id: 'messias',
    name: 'Dr. Messias Martins',
    specialty: 'Gastroenterologista',
    registration: 'CRM 12345',
    initials: 'MM',
    color: '#20C4C9',
    photoSrc: img('photo-1612349317150-e413f6a5b16d', 200),
  },
  {
    id: 'juliana',
    name: 'Dra. Juliana Andrade',
    specialty: 'Endoscopia Digestiva',
    registration: 'CRM 67890',
    initials: 'JA',
    color: '#FF6B35',
    photoSrc: img('photo-1559839734-2b71ea197ec2', 200),
  },
  {
    id: 'rafael',
    name: 'Dr. Rafael Nunes',
    specialty: 'Hepatologista',
    registration: 'CRM 11111',
    initials: 'RN',
    color: '#FFC533',
    photoSrc: img('photo-1622253692010-333f2da6031d', 200),
  },
  {
    id: 'carlos',
    name: 'Dr. Carlos Eduardo',
    specialty: 'Cirurgia Digestiva',
    registration: 'CRM 22222',
    initials: 'CE',
    color: '#082A4F',
    photoSrc: img(unsplash.doctorPortrait, 200),
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'lucas',
    quote: 'A plataforma mudou minha forma de estudar. Os conteúdos são práticos e atualizados.',
    name: 'Dr. Lucas Ferreira',
    role: 'Gastroenterologista',
    initials: 'LF',
  },
  {
    id: 'camila',
    quote: 'Excelente qualidade das aulas e dos professores. Recomendo para toda a equipe de saúde.',
    name: 'Dra. Camila Mendes',
    role: 'Clínica Médica',
    initials: 'CM',
  },
  {
    id: 'joao',
    quote: 'Os cursos me deram mais segurança no dia a dia e fizeram diferença na prática.',
    name: 'Enf. João Pedro',
    role: 'Enfermagem',
    initials: 'JP',
  },
];

export const benefits: Benefit[] = [
  { id: 'continuo', title: 'Aprendizado contínuo', description: 'Conteúdos atualizados constantemente.', icon: 'refresh' },
  { id: 'flexivel', title: 'Flexível e acessível', description: 'Estude no seu tempo, de onde estiver.', icon: 'clock' },
  { id: 'suporte', title: 'Suporte especializado', description: 'Nossa equipe está pronta para ajudar.', icon: 'headset' },
  { id: 'cert', title: 'Certificação garantida', description: 'Reconhecimento para sua carreira.', icon: 'award' },
];
