// Core types inferred from OpenAPI spec to ensure self-contained stability 
export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE';

// INTERFACE PARA O PERFIL DO USUÁRIO
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string | null;
  bio?: string | null;
  specialty?: string | null;
  phone?: string | null;
  cpf?: string | null;
  createdAt: string;
}

// INTERFACE PARA USUÁRIO NO PAINEL DO COORDENADOR
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  phone?: string | null;
  cpf?: string | null;
  createdAt: string;
}

// TIPOS PARA O NÍVEL DO CURSO
export type CourseLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
// TIPOS PARA O STATUS DO CURSO
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// INTERFACE PARA O CURSO
export interface Course {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  specialty?: string | null;
  level: CourseLevel;
  status: CourseStatus;
  workloadHours?: number | null;
  tags: string[];
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

// INTERFACE PARA O CURSO COM ESTADÍSTICAS
export interface CourseWithStats extends Course {
  enrollmentCount: number;
  completionRate: number;
  averageProgress: number;
}

// TIPOS PARA O TIPO DE AULA
export type LessonType = 'VIDEO' | 'TEXT' | 'PDF' | 'QUIZ' | 'MIXED';

// INTERFACE PARA A AULA
export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string | null;
  order: number;
  type: LessonType;
  videoUrl?: string | null;
  /** Provedor de vídeo: vimeo quando configurado no admin. */
  videoProvider?: string | null;
  /** ID Vimeo — visível apenas no editor do professor. */
  vimeoVideoId?: string | null;
  vimeoEmbedUrl?: string | null;
  /**
   * @deprecated Legado S3 — mantido para migração; não exposto ao aluno.
   */
  videoObjectKey?: string | null;
  /** @deprecated Removido — playback via Vimeo. */
  videoPlaybackUrl?: string | null;
  /** @deprecated Removido — playback via Vimeo. */
  videoHlsPlaybackUrl?: string | null;
  /** Duração do vídeo em segundos. */
  duration?: number | null;
  /** Tamanho do arquivo de vídeo em bytes (apenas editor do professor). */
  videoSizeBytes?: number | null;
  /** Content-Type do vídeo (ex.: "video/mp4"). */
  videoContentType?: string | null;
  /** Largura do vídeo em pixels. */
  videoWidth?: number | null;
  /** Altura do vídeo em pixels. */
  videoHeight?: number | null;
  /** Data em que o vídeo foi enviado/publicado (ISO string). */
  videoUploadedAt?: string | null;
  isPublished: boolean;
  createdAt: string;
}

// INTERFACE PARA O MÓDULO
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  createdAt: string;
}

// INTERFACE PARA O MÓDULO COM AULAS
export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

// INTERFACE PARA O DETALHE DO CURSO
export interface CourseDetail extends Course {
  modules: ModuleWithLessons[];
  enrollmentCount: number;
}

// INTERFACE PARA A INSCRIÇÃO
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string | null;
  progressPercent: number;
}

// INTERFACE PARA A INSCRIÇÃO COM CURSO
export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  lastLessonId?: string | null;
  lastLessonTitle?: string | null;
}

// INTERFACE PARA A OPÇÃO DO QUIZ
export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

// INTERFACE PARA A QUESTÃO DO QUIZ
export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  order: number;
  explanation?: string | null;
  options: QuizOption[];
}

// INTERFACE PARA O QUIZ
export interface Quiz {
  id: string;
  lessonId?: string | null;
  moduleId?: string | null;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
  createdAt: string;
}

// INTERFACE PARA A AULA COM PROGRESSO
export interface LessonWithProgress extends Lesson {
  /** Vídeo no Vimeo — dados do player via GET /courses/:courseId/lessons/:lessonId/video */
  hasVimeoVideo?: boolean;
  /** Aula ainda com vídeo legado no S3, pendente de migração para Vimeo. */
  videoMigrationPending?: boolean;
  isCompleted: boolean;
  watchedSeconds: number;
  quiz?: Quiz;
}

export type LessonPreviewStatus = 'AVAILABLE' | 'COMPLETED' | 'COMING_SOON';

export interface StudentDashboardFacultySocialLink {
  label: string;
  url: string;
}

export interface StudentDashboardFacultyTaughtLesson {
  moduleTitle: string;
  lessonTitle: string;
  lessonId?: string | null;
}

export interface StudentDashboardFacultyMember {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  specialty?: string | null;
  bioShort: string;
  bioFull: string;
  specializations: string[];
  practiceAreas: string[];
  experience: string;
  academicFormation: string;
  certifications: string[];
  achievements: string[];
  socialLinks: StudentDashboardFacultySocialLink[];
  courseThemes: string[];
  taughtLessons: StudentDashboardFacultyTaughtLesson[];
  languagesSpoken: string[];
  facultyRole?: string | null;
  headline?: string | null;
}

export interface StudentDashboardLessonPreview {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  duration?: number | null;
  moduleTitle: string;
  moduleOrder: number;
  lessonOrder: number;
  isCompleted: boolean;
  watchedSeconds: number;
  status: LessonPreviewStatus;
  videoUrl?: string | null;
  /** Vídeo no Vimeo — prévia no carrossel via embed autenticado. */
  hasVimeoVideo?: boolean;
}

export interface StudentDashboardMuralNextItem {
  lessonId: string;
  title: string;
  moduleTitle: string;
  status: LessonPreviewStatus;
}

export interface StudentDashboardMuralModuleSummary {
  moduleId: string;
  title: string;
  publishedLessons: number;
  completedLessons: number;
}

export interface StudentDashboardMuralComplementary {
  lessonId: string;
  title: string;
  type: string;
}

export interface StudentDashboardMural {
  progressPercent: number;
  modulesSummary: StudentDashboardMuralModuleSummary[];
  nextUp: StudentDashboardMuralNextItem[];
  recommended?: {
    lessonId: string;
    title: string;
    moduleTitle: string;
  } | null;
  bulletins: string[];
  complementary: StudentDashboardMuralComplementary[];
  stats: {
    totalPublishedLessons: number;
    completedLessons: number;
    comingSoonLessons: number;
  };
}

export interface StudentDashboardSingleCourseHome {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseCover?: string | null;
  courseSpecialty?: string | null;
  firstModuleTitle: string;
  faculty: StudentDashboardFacultyMember[];
  lessonRowTop: StudentDashboardLessonPreview[];
  lessonFourth?: StudentDashboardLessonPreview | null;
  /** Carga horária cadastrada no curso (`courses.workload_hours`). */
  workloadHours?: number | null;
  mural: StudentDashboardMural;
}

// INTERFACE PARA O DASHBOARD DO ALUNO
export interface StudentDashboard {
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  inProgressCoursesCount: number;
  /** Presente quando a API retorna a experiência estendida (curso único). */
  singleCourseHome?: StudentDashboardSingleCourseHome | null;
  recentEnrollments: EnrollmentWithCourse[];
  recentQuizAttempts: any[];
}

// INTERFACE PARA O DASHBOARD DO PROFESSOR
export interface TeacherDashboard {
  publishedCoursesCount: number;
  totalStudentsCount: number;
  averageCompletionRate: number;
  averageQuizScore: number;
  courses: CourseWithStats[];
}

export interface LessonMaterial {
  id: string;
  lessonId: string;
  title: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonMaterialsLimits {
  maxFiles: number;
  maxFileSizeMb: number;
  maxTotalSizeMb: number;
  allowedFormats: string[];
  guidanceText: string;
}

export interface LessonMaterialsListResponse {
  materials: LessonMaterial[];
  limits: LessonMaterialsLimits;
}

export interface LessonMaterialsStorageStats {
  storageRoot: string;
  totalBytes: number | null;
  usedBytes: number | null;
  availableBytes: number | null;
  usedPercent: number | null;
  level: 'ok' | 'warning' | 'critical' | 'blocked';
  totalMaterials: number;
  totalMaterialsBytes: number;
  byCourse: Array<{ courseId: string; materialCount: number; totalBytes: number }>;
  byLesson: Array<{ lessonId: string; courseId: string; materialCount: number; totalBytes: number }>;
  alerts: string[];
  uploadsBlocked: boolean;
}
