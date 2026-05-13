import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TeacherDashboard, CourseWithStats, CourseDetail, CourseStatus, UserProfile } from '@/types/api';

// FUNÇÃO PARA CONSULTAR DADOS DO DASHBOARD DO PROFESSOR
export function useTeacherDashboard() {
  return useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get<TeacherDashboard>('/teacher/dashboard');
      return res.data;
    },
  });
}

// FUNÇÃO PARA LISTAR CURSOS DO PROFESSOR
export function useTeacherCourses() {
  return useQuery({
    queryKey: ['teacher-courses'],
    queryFn: async () => {
      const res = await api.get<CourseWithStats[]>('/teacher/courses');
      return res.data;
    },
  });
}

// FUNÇÃO PARA BUSCAR DETALHES DE UM CURSO DO PROFESSOR
export function useTeacherCourse(id: string) {
  return useQuery({
    queryKey: ['teacher-course', id],
    queryFn: async () => {
      const res = await api.get<CourseDetail>(`/teacher/courses/${id}`);
      return res.data;
    },
    enabled: !!id && id !== 'new',
  });
}

// FUNÇÃO PARA CRIAR UM NOVO CURSO
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/teacher/courses', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
}

// FUNÇÃO PARA ATUALIZAR UM CURSO EXISTENTE
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.put(`/teacher/courses/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
}

// FUNÇÃO PARA CRIAR UM MÓDULO DENTRO DE UM CURSO
export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/teacher/modules', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', variables.courseId] });
    },
  });
}

// FUNÇÃO PARA ATUALIZAR UM MÓDULO EXISTENTE
export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; description?: string | null; order?: number };
      courseId?: string;
    }) => {
      const res = await api.put(`/teacher/modules/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['teacher-course', variables.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['teacher-course'] });
      }
    },
  });
}

// FUNÇÃO PARA EXCLUIR UM MÓDULO (CASCATA REMOVE AS AULAS VINCULADAS)
export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; courseId?: string }) => {
      const res = await api.delete(`/teacher/modules/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['teacher-course', variables.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['teacher-course'] });
      }
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
}

// FUNÇÃO PARA CRIAR UMA NOVA AULA NO CURSO
export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/teacher/lessons', data);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all course details to be safe since we might not have courseId easily here
      queryClient.invalidateQueries({ queryKey: ['teacher-course'] });
    },
  });
}

// FUNÇÃO PARA EXCLUIR UM CURSO (REMOÇÃO COMPLETA, INCLUINDO MÓDULOS E AULAS POR CASCADE)
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/teacher/courses/${id}`);
      return res.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.removeQueries({ queryKey: ['teacher-course', id] });
    },
  });
}

// FUNÇÃO PARA PUBLICAR UM CURSO
export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/teacher/courses/${id}/publish`);
      return res.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
}

// FUNÇÃO PARA ALTERAR STATUS DE PUBLICAÇÃO DO CURSO
export function useSetCourseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Extract<CourseStatus, 'DRAFT' | 'PUBLISHED'> }) => {
      const endpoint = status === 'PUBLISHED' ? 'publish' : 'unpublish';
      const res = await api.post(`/teacher/courses/${id}/${endpoint}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    },
  });
}

// FUNÇÃO PARA BUSCAR O PERFIL DO PROFESSOR AUTENTICADO
export function useTeacherProfile() {
  return useQuery({
    queryKey: ['teacher-profile'],
    queryFn: async () => {
      const res = await api.get<UserProfile>('/auth/me');
      return res.data;
    },
  });
}

// FUNÇÃO PARA ATUALIZAR DADOS DE PERFIL DO PROFESSOR
export function useUpdateTeacherProfile() {
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
      const res = await api.put('/teacher/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

// FUNÇÃO PARA ALTERAR A SENHA DO PROFESSOR
export function useUpdateTeacherPassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.put('/teacher/security/password', data);
      return res.data;
    },
  });
}

// FUNÇÃO PARA SOLICITAR URL PRÉ-ASSINADA DE UPLOAD DE VÍDEO
export function usePresignLessonVideo() {
  return useMutation({
    mutationFn: async (params: {
      lessonId: string;
      fileName: string;
      contentType: string;
      fileSizeBytes: number;
    }) => {
      const res = await api.post<{
        uploadUrl: string;
        objectKey: string;
        headers: { 'Content-Type': string };
      }>('/teacher/videos/presign-upload', params);
      return res.data;
    },
  });
}

// FUNÇÃO PARA ATUALIZAR UMA AULA EXISTENTE
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await api.put(`/teacher/lessons/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course'] });
    },
  });
}

// FUNÇÃO PARA EXCLUIR UMA AULA
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; courseId?: string }) => {
      const res = await api.delete(`/teacher/lessons/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['teacher-course', variables.courseId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['teacher-course'] });
      }
    },
  });
}
