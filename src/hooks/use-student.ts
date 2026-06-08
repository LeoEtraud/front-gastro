import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { StudentDashboard, EnrollmentWithCourse, LessonWithProgress, UserProfile } from '@/types/api';

// FUNÇÃO PARA CONSULTAR DADOS DO DASHBOARD DO ALUNO
export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get<StudentDashboard>('/student/dashboard');
      return res.data;
    },
    // Dashboard muda raramente; 5 min de stale evita refetch desnecessário
    // entre navegações e mantém o dado prefetchado pelo login em cache.
    staleTime: 5 * 60_000,
    // Mantém dado anterior visível enquanto busca em background (sem flash de skeleton)
    placeholderData: (prev) => prev,
  });
}

// FUNÇÃO PARA LISTAR MATRÍCULAS DO ALUNO
export function useStudentEnrollments() {
  return useQuery({
    queryKey: ['student-enrollments'],
    queryFn: async () => {
      const res = await api.get<EnrollmentWithCourse[]>('/student/enrollments');
      return res.data;
    },
  });
}

// FUNÇÃO PARA MATRICULAR O ALUNO EM UM CURSO
export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.post(`/student/courses/${courseId}/enroll`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });
}

// FUNÇÃO PARA CARREGAR OS DADOS DE UMA AULA DO ALUNO
export function useStudentLesson(lessonId: string) {
  return useQuery({
    queryKey: ['student-lesson', lessonId],
    queryFn: async () => {
      const res = await api.get<LessonWithProgress>(`/student/lessons/${lessonId}`);
      return res.data;
    },
    enabled: !!lessonId,
    // Mantém a aula anterior na tela durante a troca para evitar "piscar" o layout.
    placeholderData: (previousData) => previousData,
  });
}

// FUNÇÃO PARA MARCAR E SINCRONIZAR O PROGRESSO DE AULA
export function useMarkLessonProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, isCompleted }: { lessonId: string, isCompleted: boolean }) => {
      const res = await api.post(`/student/lessons/${lessonId}/progress`, { isCompleted });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
    },
  });
}

// FUNÇÃO PARA BUSCAR O PERFIL DO ALUNO AUTENTICADO
export function useStudentProfile() {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const res = await api.get<UserProfile>('/auth/me');
      return res.data;
    },
  });
}

// FUNÇÃO PARA ATUALIZAR DADOS DE PERFIL DO ALUNO
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      bio?: string;
      specialty?: string;
      phone?: string;
      cpf?: string;
      avatarUrl?: string;
    }) => {
      const res = await api.put('/student/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

// FUNÇÃO PARA ALTERAR A SENHA DO ALUNO
export function useUpdateStudentPassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.put('/student/security/password', data);
      return res.data;
    },
  });
}
