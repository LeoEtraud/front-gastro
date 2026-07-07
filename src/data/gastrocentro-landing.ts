/** Conteúdo editorial da landing GastroCentro — imagens via [Unsplash](https://unsplash.com/pt-br). */

import { COURSE_MATERIALS_DRIVE_URL } from '@/lib/course-materials-config';

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

/** URL do vídeo de apresentação do curso (embed Instagram, YouTube, Vimeo, etc.). */
export const GASTRO_INTRO_VIDEO_URL = 'https://www.instagram.com/reel/DXM-i_OiXjt/embed';

/** URL da pasta de materiais complementares no Google Drive. */
export const GASTRO_MATERIALS_DRIVE_URL = COURSE_MATERIALS_DRIVE_URL;

export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  primaryAction?: 'link' | 'video';
  secondaryCta?: string;
  secondaryHref?: string;
  imageSrc: string;
  imageAlt: string;
};

export type StartHereCard = {
  id: string;
  title: string;
  description: string;
  icon: 'routes' | 'star' | 'files';
  href: string;
  external?: boolean;
};

export type PlatformCourse = {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  topics: string[];
  imageSrc: string;
};

export type Specialist = {
  id: string;
  name: string;
  registration?: string;
  initials: string;
  color: string;
  photoSrc?: string;
  /** URL do LinkedIn — deixe vazio enquanto não estiver disponível. */
  linkedinUrl?: string;
};

const medicoPhoto = (filename: string) => `/medicos/${encodeURIComponent(filename)}`;

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  /** Quando true, exibe placeholder editorial em vez de depoimento fictício. */
  placeholder?: boolean;
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
    primaryHref: '/login',
    primaryAction: 'video',
    imageSrc: img('photo-1576091160399-112ba8d25d1d'),
    imageAlt: 'Profissionais de saúde em ambiente clínico moderno',
  },
  {
    id: 'slide-2',
    badge: 'Plataforma GastroCentro',
    title: 'Aprenda por especialidades',
    subtitle:
      'Conteúdos organizados para sua formação em saúde digestiva, com expansão contínua de novos cursos.',
    primaryCta: 'Acessar plataforma',
    primaryHref: '/login',
    imageSrc: img('photo-1582719478250-c89cae4dc85b'),
    imageAlt: 'Equipamento médico de endoscopia digestiva',
  },
  {
    id: 'slide-3',
    badge: 'Especialistas',
    title: 'Aulas com médicos de referência',
    subtitle: 'Conteúdos conduzidos por médicos experientes e reconhecidos na prática clínica.',
    primaryCta: 'Conhecer especialistas',
    primaryHref: '#especialistas',
    imageSrc: img('photo-1612349317150-e413f6a5b16d'),
    imageAlt: 'Médico especialista em consulta',
  },
  {
    id: 'slide-4',
    badge: 'Certificação',
    title: 'Evolua sua carreira com conteúdos certificados',
    subtitle: 'Conclua cursos, acompanhe seu progresso e fortaleça sua formação profissional.',
    primaryCta: 'Começar agora',
    primaryHref: '/register',
    imageSrc: img('photo-1454165804606-c3d57bc86b40'),
    imageAlt: 'Profissional estudando materiais clínicos',
  },
];

export const stats = [
  {
    id: 'course',
    title: 'Curso inicial disponível',
    subtitle: 'Fellowship em Endoscopia Digestiva Alta',
    icon: 'book' as const,
  },
  {
    id: 'experts',
    title: 'Aulas com especialistas',
    subtitle: 'Conteúdo conduzido por profissionais de referência',
    icon: 'users' as const,
  },
  {
    id: 'materials',
    title: 'Materiais complementares',
    subtitle: 'Apoio ao aprendizado com arquivos e conteúdos extras',
    icon: 'files' as const,
  },
  {
    id: 'certification',
    title: 'Certificação',
    subtitle: 'Formação com conteúdo certificado',
    icon: 'award' as const,
  },
];

export const startHereCards: StartHereCard[] = [
  {
    id: 'trilhas',
    title: 'Trilha de aprendizado',
    description:
      'Acesse a plataforma, entre no curso disponível, acompanhe as aulas na sequência indicada e utilize os materiais complementares para aprofundar seus estudos.',
    icon: 'routes',
    href: '/login',
  },
  {
    id: 'destaques',
    title: 'Aulas em destaque',
    description: 'Seleção dos conteúdos mais acessados do curso disponível na plataforma.',
    icon: 'star',
    href: '#cursos-destaque',
  },
  {
    id: 'materiais',
    title: 'Materiais complementares',
    description:
      'Os materiais complementares são organizados por aula ou módulo do curso, com apoio ao aprendizado por meio de arquivos, documentos e conteúdos extras.',
    icon: 'files',
    href: GASTRO_MATERIALS_DRIVE_URL || '/login',
    external: Boolean(GASTRO_MATERIALS_DRIVE_URL),
  },
];

export const platformCourse: PlatformCourse = {
  id: 'fellowship-endoscopia',
  title: 'Fellowship em Endoscopia Digestiva Alta',
  description:
    'Formação completa em endoscopia digestiva alta, com abordagem teórica e prática para o desenvolvimento de competências essenciais na área.',
  targetAudience:
    'Médicos gastroenterologistas, cirurgiões do aparelho digestivo, residentes e profissionais em formação na área digestiva.',
  topics: [
    'Fundamentos e indicações da EDA',
    'Técnicas de inspeção e documentação',
    'Procedimentos diagnósticos e terapêuticos',
    'Interpretação e conduta clínica',
  ],
  imageSrc: '/capa-curso.jpg',
};

export const specialists: Specialist[] = [
  {
    id: 'jose-junior',
    name: 'Dr. José Junior',
    registration: 'CRM 3080 MA',
    initials: 'JJ',
    color: '#082A4F',
    photoSrc: medicoPhoto('JOSÉ JUNIOR - CRM 3080 MA.png'),
    linkedinUrl: '',
  },
  {
    id: 'jerusa-reis',
    name: 'Dra. Jerusa Reis',
    initials: 'JR',
    color: '#FF6B35',
    photoSrc: medicoPhoto('JERUSA REIS.png'),
    linkedinUrl: '',
  },
  {
    id: 'tiago-vieira',
    name: 'Dr. Tiago Vieira',
    initials: 'TV',
    color: '#FF6B35',
    photoSrc: medicoPhoto('TIAGO VIEIRA.jpeg'),
    linkedinUrl: '',
  },
  {
    id: 'lalileia',
    name: 'Dra. Lalileia',
    initials: 'LA',
    color: '#FFC533',
    photoSrc: medicoPhoto('LALILEIA.png'),
    linkedinUrl: '',
  },
  {
    id: 'glayton-costa',
    name: 'Dr. Glayton Costa',
    registration: 'CRM 2594 MA',
    initials: 'GC',
    color: '#20C4C9',
    photoSrc: medicoPhoto('GLAYTON COSTA - CRM 2594 MA.png'),
    linkedinUrl: '',
  },
  {
    id: 'rogerio',
    name: 'Dr. Rogério',
    initials: 'RO',
    color: '#20C4C9',
    photoSrc: medicoPhoto('WhatsApp Image 2026-07-06 at 16.45.03.jpeg'),
    linkedinUrl: '',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    quote: '',
    name: '',
    role: '',
    initials: '?',
    placeholder: true,
  },
  {
    id: 'placeholder-2',
    quote: '',
    name: '',
    role: '',
    initials: '?',
    placeholder: true,
  },
  {
    id: 'placeholder-3',
    quote: '',
    name: '',
    role: '',
    initials: '?',
    placeholder: true,
  },
];

export const benefits: Benefit[] = [
  { id: 'continuo', title: 'Aprendizado contínuo', description: 'Conteúdos atualizados constantemente.', icon: 'refresh' },
  { id: 'flexivel', title: 'Flexível e acessível', description: 'Estude no seu tempo, de onde estiver.', icon: 'clock' },
  { id: 'suporte', title: 'Suporte especializado', description: 'Nossa equipe está pronta para ajudar.', icon: 'headset' },
  { id: 'cert', title: 'Certificação garantida', description: 'Reconhecimento para sua carreira.', icon: 'award' },
];
