import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type {
  LessonMaterial,
  LessonMaterialsListResponse,
  LessonMaterialsStorageStats,
} from '@/types/api';

export function useTeacherLessonMaterials(lessonId: string, enabled = true) {
  return useQuery({
    queryKey: ['teacher-lesson-materials', lessonId],
    queryFn: async () => {
      const res = await api.get<LessonMaterialsListResponse>(`/teacher/lessons/${lessonId}/materials`);
      return res.data;
    },
    enabled: !!lessonId && enabled,
  });
}

export function useStudentLessonMaterials(lessonId: string, enabled = true) {
  return useQuery({
    queryKey: ['student-lesson-materials', lessonId],
    queryFn: async () => {
      const res = await api.get<{ materials: LessonMaterial[] }>(`/student/lessons/${lessonId}/materials`);
      return res.data.materials;
    },
    enabled: !!lessonId && enabled,
  });
}

export function useLessonMaterialsStorageStats(enabled = true) {
  return useQuery({
    queryKey: ['lesson-materials-storage'],
    queryFn: async () => {
      const res = await api.get<LessonMaterialsStorageStats>('/teacher/materials/storage');
      return res.data;
    },
    enabled,
  });
}

export function useUploadLessonMaterial(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      title,
      onProgress,
    }: {
      file: File;
      title?: string;
      onProgress?: (percent: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (title?.trim()) formData.append('title', title.trim());
      const res = await api.post<LessonMaterial>(`/teacher/lessons/${lessonId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return;
          onProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-materials', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-materials-storage'] });
    },
  });
}

export function useReplaceLessonMaterialFile(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      materialId,
      file,
      onProgress,
    }: {
      materialId: string;
      file: File;
      onProgress?: (percent: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.put<LessonMaterial>(
        `/teacher/lessons/${lessonId}/materials/${materialId}/file`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (!event.total) return;
            onProgress?.(Math.round((event.loaded * 100) / event.total));
          },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-materials', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-materials-storage'] });
    },
  });
}

export function useUpdateLessonMaterialTitle(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ materialId, title }: { materialId: string; title: string }) => {
      const res = await api.patch<LessonMaterial>(`/teacher/lessons/${lessonId}/materials/${materialId}`, {
        title,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-materials', lessonId] });
    },
  });
}

export function useReorderLessonMaterials(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await api.patch<{ materials: LessonMaterial[] }>(
        `/teacher/lessons/${lessonId}/materials/reorder`,
        { orderedIds },
      );
      return res.data.materials;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-materials', lessonId] });
    },
  });
}

export function useDeleteLessonMaterial(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (materialId: string) => {
      await api.delete(`/teacher/lessons/${lessonId}/materials/${materialId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-materials', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-materials', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lesson-materials-storage'] });
    },
  });
}

export async function downloadStudentLessonMaterial(
  lessonId: string,
  materialId: string,
  fallbackName: string,
): Promise<void> {
  const res = await api.get(`/student/lessons/${lessonId}/materials/${materialId}/download`, {
    responseType: 'blob',
  });

  const disposition = res.headers['content-disposition'] as string | undefined;
  let filename = fallbackName;
  if (disposition) {
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
    const extracted = match?.[1] || match?.[2];
    if (extracted) filename = decodeURIComponent(extracted);
  }

  const blob = new Blob([res.data], {
    type: typeof res.headers['content-type'] === 'string' ? res.headers['content-type'] : 'application/octet-stream',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
