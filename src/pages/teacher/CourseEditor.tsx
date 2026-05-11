import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useTeacherCourse,
  useUpdateCourse,
  useSetCourseStatus,
  usePresignLessonVideo,
  useUpdateLesson,
} from '@/hooks/use-teacher';
import type { Lesson } from '@/types/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CompactContentSkeleton, CourseEditorSkeleton } from '@/components/ui/content-skeletons';
import { useForm } from 'react-hook-form';
import { Plus, Video, FileQuestion, GripVertical, Upload, Trash2, ImagePlus, BookCheck, Save, Info, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateLessonModal, CreateModuleModal } from '@/components/course-management/create-entity-modals';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEDICAL_SPECIALTIES } from '@/lib/medical-specialties';
import { uploadCourseCoverFile } from '@/lib/course-cover-upload';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// FUNÇÃO PARA PARSEAR O ERRO DO S3
function parseS3ErrorText(raw: string): string | null {
  const code = raw.match(/<Code>([^<]+)<\/Code>/)?.[1];
  const message = raw.match(/<Message>([^<]+)<\/Message>/)?.[1];
  if (!code && !message) return null;
  return [code, message].filter(Boolean).join(': ');
}

type UploadWithProgressParams = {
  uploadUrl: string;
  file: File;
  contentType: string;
  onProgress: (percent: number) => void;
};

// FUNÇÃO PARA EXTRAIR METADADOS LOCAIS DO ARQUIVO DE VÍDEO (DURAÇÃO + DIMENSÕES)
type LocalVideoMetadata = {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
};

function extractLocalVideoMetadata(file: File): Promise<LocalVideoMetadata> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = url;

    const finish = (meta: LocalVideoMetadata) => {
      URL.revokeObjectURL(url);
      resolve(meta);
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : null;
      const width = video.videoWidth || null;
      const height = video.videoHeight || null;
      finish({ durationSeconds: duration, width, height });
    };
    video.onerror = () => {
      finish({ durationSeconds: null, width: null, height: null });
    };
  });
}

// FUNÇÃO PARA FORMATAR TAMANHO DE ARQUIVO EM FORMATO LEGÍVEL
function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const precision = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

// FUNÇÃO PARA FORMATAR DURAÇÃO EM HH:MM:SS OU MM:SS
function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// FUNÇÃO PARA DERIVAR UM RÓTULO DE QUALIDADE A PARTIR DA ALTURA/CONTENT-TYPE
function formatVideoQuality(height?: number | null, width?: number | null, contentType?: string | null): string {
  if (height && height > 0) {
    // Escadas padrão de qualidade por altura vertical
    const stairs = [240, 360, 480, 720, 1080, 1440, 2160];
    let chosen = stairs[0]!;
    for (const s of stairs) {
      if (height >= s) chosen = s;
    }
    const codec = contentType?.split('/')[1]?.toUpperCase();
    const resolution = width ? `${width}×${height}` : `${height}p`;
    return codec ? `${chosen}p (${resolution} · ${codec})` : `${chosen}p (${resolution})`;
  }
  if (contentType) {
    const codec = contentType.split('/')[1]?.toUpperCase();
    return codec ? `Formato ${codec}` : contentType;
  }
  return '—';
}

// FUNÇÃO PARA FORMATAR DATA/HORA EM PT-BR
function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function uploadFileWithProgress({ uploadUrl, file, contentType, onProgress }: UploadWithProgressParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)));
      onProgress(percent);
    };

    xhr.onerror = () => reject(new Error('Falha de rede durante o upload do vídeo.'));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      const rawBody = typeof xhr.responseText === 'string' ? xhr.responseText : '';
      const s3Reason = parseS3ErrorText(rawBody);
      reject(new Error(s3Reason ? `Upload falhou (${xhr.status}) - ${s3Reason}` : `Upload falhou (${xhr.status})`));
    };

    xhr.send(file);
  });
}

// FUNÇÃO PARA EDITAR UMA AULA
function LessonEditorRow({ lesson }: { lesson: Lesson }) {
  const presign = usePresignLessonVideo();
  const updateLesson = useUpdateLesson();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef<string | null>(null);
  const [externalUrl, setExternalUrl] = useState(lesson.videoUrl ?? '');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (lesson.videoObjectKey) {
      setExternalUrl('');
    } else {
      setExternalUrl(lesson.videoUrl ?? '');
    }
  }, [lesson.id, lesson.videoUrl, lesson.videoObjectKey]);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    };
  }, []);

  const hasHosted = !!lesson.videoObjectKey;
  const hasExternal = !!lesson.videoUrl && !hasHosted;
  const previewUrl = localVideoPreviewUrl || lesson.videoPlaybackUrl || (!hasHosted ? lesson.videoUrl : null) || null;
  const busy = isUploading || presign.isPending || (updateLesson.isPending && !isRemovingVideo);
  const sourceLabel = hasHosted ? 'Hospedado' : hasExternal ? 'Externo' : 'Sem vídeo';

  const setLocalPreviewFromFile = (file: File) => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    setLocalVideoPreviewUrl(objectUrl);
  };

  const clearLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setLocalVideoPreviewUrl(null);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast({ variant: 'destructive', title: 'Selecione um arquivo de vídeo' });
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      // Lê metadados locais (duração, resolução) antes do upload para persistir no backend
      const localMeta = await extractLocalVideoMetadata(file);
      const { uploadUrl, objectKey, headers } = await presign.mutateAsync({
        lessonId: lesson.id,
        fileName: file.name,
        contentType: file.type,
        fileSizeBytes: file.size,
      });
      await uploadFileWithProgress({
        uploadUrl,
        file,
        contentType: headers['Content-Type'],
        onProgress: (percent) => setUploadProgress(percent),
      });
      await updateLesson.mutateAsync({
        id: lesson.id,
        data: {
          type: 'VIDEO',
          videoObjectKey: objectKey,
          videoSizeBytes: file.size,
          videoContentType: file.type || null,
          duration: localMeta.durationSeconds,
          videoWidth: localMeta.width,
          videoHeight: localMeta.height,
        },
      });
      setLocalPreviewFromFile(file);
      setExternalUrl('');
      toast({ variant: 'success', title: 'Vídeo enviado com sucesso' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } }; message?: string };
      toast({
        variant: 'destructive',
        title: 'Falha no upload',
        description: ax?.response?.data?.error || ax?.message || 'Verifique CORS do bucket e variáveis S3/R2.',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const onSaveExternal = async () => {
    const url = externalUrl.trim();
    if (!url) {
      toast({ variant: 'destructive', title: 'Cole um link válido' });
      return;
    }
    try {
      await updateLesson.mutateAsync({ id: lesson.id, data: { videoUrl: url, videoObjectKey: null } });
      clearLocalPreview();
      toast({ variant: 'success', title: 'Link externo salvo' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar link' });
    }
  };

  const onDeleteVideo = async () => {
    setIsRemovingVideo(true);
    try {
      await updateLesson.mutateAsync({ id: lesson.id, data: { videoObjectKey: null, videoUrl: null } });
      clearLocalPreview();
      setExternalUrl('');
      setUploadProgress(null);
      toast({ variant: 'success', title: 'Vídeo removido com sucesso' });
    } catch {
      toast({ variant: 'destructive', title: 'Falha ao remover vídeo' });
    } finally {
      setIsRemovingVideo(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/70" />
          {lesson.type === 'VIDEO' ? (
            <Video className="w-4 h-4 text-blue-500 shrink-0" />
          ) : (
            <FileQuestion className="w-4 h-4 text-orange-500 shrink-0" />
          )}
          <span className="truncate text-sm font-medium text-foreground">{lesson.title}</span>
          <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
            {sourceLabel}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          isLoading={busy}
          className="sm:shrink-0 border-primary/30 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/20 focus-visible:ring-primary"
        >
          <Upload className="w-4 h-4 mr-1" />
          Upload de Vídeo
        </Button>
      </div>

      <input
        type="file"
        ref={fileRef}
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={onFileChange}
      />

      {uploadProgress !== null && (
        <div className="space-y-1.5 rounded-md border border-border/70 bg-muted/40 p-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Enviando vídeo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2.5" />
        </div>
      )}

      {previewUrl && (
        <div className="rounded-md border border-border/70 bg-muted/30 p-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Pré-visualização do vídeo</p>
              <div className="w-full max-w-[15rem] overflow-hidden rounded-md bg-black/90 sm:max-w-[16rem]">
                <video src={previewUrl} controls preload="metadata" className="aspect-video w-full" />
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  isLoading={isRemovingVideo}
                  aria-label="Excluir vídeo"
                  title="Excluir vídeo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir vídeo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este vídeo? Essa ação remove a pré-visualização e desvincula o vídeo da aula.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isRemovingVideo}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async (event) => {
                        event.preventDefault();
                        await onDeleteVideo();
                        setIsDeleteDialogOpen(false);
                      }}
                      disabled={isRemovingVideo}
                    >
                      {isRemovingVideo ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {hasHosted ? (
                <Button
                  type="button"
                  size="icon"
                  onClick={() => setIsInfoDialogOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 border-transparent"
                  aria-label="Informações do vídeo"
                  title="Informações do vídeo"
                >
                  <Info className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informações do vídeo</DialogTitle>
            <DialogDescription>
              Metadados do arquivo enviado para esta aula.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data de publicação</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {formatDateTime(lesson.videoUploadedAt)}
              </dd>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tamanho do arquivo</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{formatFileSize(lesson.videoSizeBytes)}</dd>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Qualidade do vídeo</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {formatVideoQuality(lesson.videoHeight, lesson.videoWidth, lesson.videoContentType)}
              </dd>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duração</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{formatDuration(lesson.duration)}</dd>
            </div>
          </dl>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsInfoDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1 space-y-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground">Link externo (ex.: YouTube)</label>
          <Input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-9"
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onSaveExternal} isLoading={updateLesson.isPending}>
          Usar link externo
        </Button>
      </div>
      {hasHosted && (
        <p className="text-xs text-muted-foreground">
          Salvar um link externo substitui o vídeo hospedado nesta aula (o arquivo antigo pode permanecer no armazenamento
          até você apagá-lo manualmente).
        </p>
      )}
    </div>
  );
}

const courseInfoSchema = z.object({
  title: z.string().trim().min(3, 'Título é obrigatório'),
  subtitle: z.string().trim().optional(),
  shortDescription: z.string().trim().min(12, 'Descrição curta é obrigatória'),
  description: z.string().trim().optional(),
  specialty: z.string().trim().min(1, 'Especialidade é obrigatória'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']),
  workloadHours: z
    .union([z.literal(''), z.coerce.number().int().min(1, 'Carga horária deve ser maior que 0')])
    .optional(),
  tags: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
});

// PÁGINA DE EDITOR DE CURSO - PÁGINA PARA EDITAR UM CURSO
export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, isError, error, refetch, isRefetching } = useTeacherCourse(id!);
  const showLoading = useDelayedFlag(isLoading);
  const updateCourse = useUpdateCourse();
  const setCourseStatus = useSetCourseStatus();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'modules'>('modules');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<string | undefined>(undefined);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  type CourseInfoForm = z.infer<typeof courseInfoSchema>;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  const form = useForm<CourseInfoForm>({
    resolver: zodResolver(courseInfoSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      shortDescription: '',
      description: '',
      specialty: '',
      level: 'BASIC',
      workloadHours: '',
      tags: '',
      coverImageUrl: '',
    },
  });

  useEffect(() => {
    if (!course) return;
    const hasKnownSpecialty = !!course.specialty && MEDICAL_SPECIALTIES.includes(course.specialty as (typeof MEDICAL_SPECIALTIES)[number]);
    form.reset({
      title: course.title ?? '',
      subtitle: course.subtitle ?? '',
      shortDescription: course.shortDescription ?? '',
      description: course.description ?? '',
      specialty: hasKnownSpecialty ? course.specialty ?? '' : '',
      level: course.level ?? 'BASIC',
      workloadHours: course.workloadHours ?? '',
      tags: course.tags?.join(', ') ?? '',
      coverImageUrl: course.coverImageUrl ?? '',
    });
    setCoverUploadError(null);
  }, [course, form]);

  const onSaveInfo = async (data: CourseInfoForm) => {
    try {
      await updateCourse.mutateAsync({
        id: id!,
        data: {
          title: data.title,
          subtitle: data.subtitle || undefined,
          shortDescription: data.shortDescription,
          description: data.description || undefined,
          specialty: data.specialty,
          level: data.level,
          workloadHours: data.workloadHours === '' ? undefined : data.workloadHours,
          coverImageUrl: data.coverImageUrl || undefined,
          tags: data.tags
            ? data.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        },
      });
      toast({ variant: 'success', title: 'Curso atualizado' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar' });
    }
  };

  const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      setCoverUploadError(null);
      const dataUrl = await uploadCourseCoverFile(file);
      form.setValue('coverImageUrl', dataUrl, { shouldDirty: true, shouldValidate: true });
    } catch (error: any) {
      setCoverUploadError(error?.message ?? 'Falha ao carregar imagem.');
    }
  };

  const handleRemoveCover = () => {
    setCoverUploadError(null);
    form.setValue('coverImageUrl', '', { shouldDirty: true, shouldValidate: true });
  };

  const handleConfirmPublishToggle = async () => {
    if (!course) return;
    const shouldPublish = course.status !== 'PUBLISHED';
    if (shouldPublish && (course.modules?.length ?? 0) === 0) {
      toast({
        variant: 'destructive',
        title: 'Não é possível publicar',
        description: 'Adicione pelo menos um módulo ao curso antes de publicar.',
      });
      setIsStatusDialogOpen(false);
      return;
    }
    try {
      await setCourseStatus.mutateAsync({ id: course.id, status: shouldPublish ? 'PUBLISHED' : 'DRAFT' });
      toast({
        variant: 'success',
        title: shouldPublish ? 'Curso publicado com sucesso' : 'Curso voltou para rascunho',
      });
      setIsStatusDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível alterar o status',
        description: error?.response?.data?.error ?? 'Tente novamente.',
      });
    }
  };

  const handleAddModule = () => setIsModuleModalOpen(true);
  const handleAddLesson = (moduleId?: string) => {
    setSelectedModuleIdForLesson(moduleId);
    setIsLessonModalOpen(true);
  };
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate('/teacher/courses');
  };

  if (isLoading && !course) {
    if (!showLoading) {
      return (
        <AppLayout>
          <CompactContentSkeleton />
        </AppLayout>
      );
    }
    return <AppLayout><CourseEditorSkeleton /></AppLayout>;
  }
  if (!course) {
    // Distingue erro de carregamento (ex.: API 500) de curso realmente inexistente (404)
    const axiosStatus = (error as { response?: { status?: number } } | null)?.response?.status;
    const is404 = axiosStatus === 404;
    const errorDetail = (error as { response?: { data?: { error?: string } }; message?: string } | null)?.response?.data?.error
      ?? (error as { message?: string } | null)?.message
      ?? null;

    return (
      <AppLayout>
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {is404 ? 'Curso não encontrado' : 'Não foi possível carregar o curso'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {is404
              ? 'O curso solicitado não existe ou você não tem permissão para acessá-lo.'
              : 'Ocorreu um erro ao buscar os dados do curso. Verifique a conexão com o servidor e tente novamente.'}
          </p>
          {!is404 && errorDetail ? (
            <p className="mt-2 text-xs text-destructive">Detalhe: {errorDetail}</p>
          ) : null}
          {isError && !is404 ? (
            <Button type="button" className="mt-4" onClick={() => refetch()} isLoading={isRefetching}>
              Tentar novamente
            </Button>
          ) : null}
        </div>
      </AppLayout>
    );
  }

  const hasModules = (course.modules?.length ?? 0) > 0;
  const publishDisabledWithoutModules = course.status !== 'PUBLISHED' && !hasModules;

  return (
    <AppLayout>
      <CreateModuleModal
        open={isModuleModalOpen}
        onOpenChange={setIsModuleModalOpen}
        courseId={id!}
        defaultOrder={(course.modules?.length || 0) + 1}
      />
      <CreateLessonModal
        open={isLessonModalOpen}
        onOpenChange={setIsLessonModalOpen}
        defaultModuleId={selectedModuleIdForLesson}
        defaultOrder={99}
        moduleOptions={(course.modules || []).map((mod) => ({
          id: mod.id,
          title: mod.title,
        }))}
      />
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={(open) => {
          if (!open && !setCourseStatus.isPending) setIsStatusDialogOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {course.status === 'PUBLISHED' ? 'Despublicar curso' : 'Publicar curso'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {course.status === 'PUBLISHED'
                ? 'Ao despublicar, o curso deixará de aparecer no catálogo para novos alunos e as aulas ficarão inacessíveis até que seja publicado novamente. Deseja continuar?'
                : 'Ao publicar, o curso ficará visível para todos os alunos no catálogo e as aulas marcadas como publicadas poderão ser acessadas. Deseja continuar?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={setCourseStatus.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={
                course.status === 'PUBLISHED'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-600'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600'
              }
              onClick={(event) => {
                event.preventDefault();
                handleConfirmPublishToggle();
              }}
              disabled={setCourseStatus.isPending || (course.status !== 'PUBLISHED' && !hasModules)}
            >
              {setCourseStatus.isPending
                ? 'Processando...'
                : course.status === 'PUBLISHED'
                  ? 'Despublicar curso'
                  : 'Publicar curso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-2 h-10 w-10 rounded-full bg-slate-700 text-white hover:bg-slate-800"
              onClick={handleGoBack}
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Editor de Curso</p>
            <h1 className="font-display text-xl font-bold sm:text-2xl md:text-3xl">{course.title}</h1>
          </div>
          <Button
            className={cn(
              course.status === 'PUBLISHED'
                ? 'w-full shrink-0 sm:w-auto bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-600 border-transparent'
                : 'w-full shrink-0 sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 border-transparent',
              publishDisabledWithoutModules && 'cursor-not-allowed !pointer-events-auto',
            )}
            isLoading={setCourseStatus.isPending}
            disabled={publishDisabledWithoutModules}
            title={
              publishDisabledWithoutModules
                ? 'Adicione pelo menos um módulo para publicar o curso.'
                : undefined
            }
            onClick={() => setIsStatusDialogOpen(true)}
          >
            <BookCheck className="mr-2 h-4 w-4" />
            {course.status === 'PUBLISHED' ? 'Despublicar curso' : 'Publicar curso'}
          </Button>
        </div>

        <div className="flex gap-1 border-b pb-px sm:gap-2">
          <button
            type="button"
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium touch-manipulation sm:px-4 ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('info')}
          >
            Informações Básicas
          </button>
          <button
            type="button"
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium touch-manipulation sm:px-4 ${activeTab === 'modules' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('modules')}
          >
            Módulos e Aulas
          </button>
        </div>

        {activeTab === 'info' && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={form.handleSubmit(onSaveInfo)} className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleCoverChange}
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                  <div className="order-2 space-y-4 xl:order-1">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título *</label>
                        <Input {...form.register('title')} />
                        {form.formState.errors.title ? (
                          <p className="text-xs font-medium text-destructive">{form.formState.errors.title.message}</p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subtítulo</label>
                        <Input {...form.register('subtitle')} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Especialidade *</label>
                        <Select
                          value={form.watch('specialty') || undefined}
                          onValueChange={(value) => form.setValue('specialty', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma especialidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICAL_SPECIALTIES.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.specialty ? (
                          <p className="text-xs font-medium text-destructive">{form.formState.errors.specialty.message}</p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nível *</label>
                        <Select
                          value={form.watch('level')}
                          onValueChange={(value) => form.setValue('level', value as CourseInfoForm['level'], { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BASIC">Básico</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediário</SelectItem>
                            <SelectItem value="ADVANCED">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Carga horária (horas)</label>
                        <Input type="number" min={1} {...form.register('workloadHours')} />
                        {form.formState.errors.workloadHours ? (
                          <p className="text-xs font-medium text-destructive">{form.formState.errors.workloadHours.message}</p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <Input {...form.register('tags')} placeholder="cardio, urgência, internato" />
                        <p className="text-xs text-muted-foreground">Separe as tags por vírgula.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descrição curta *</label>
                      <Input {...form.register('shortDescription')} />
                      {form.formState.errors.shortDescription ? (
                        <p className="text-xs font-medium text-destructive">{form.formState.errors.shortDescription.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descrição Completa</label>
                      <textarea
                        {...form.register('description')}
                        className="min-h-32 w-full resize-y rounded-md border border-input bg-background p-3 text-base md:text-sm"
                      />
                    </div>
                  </div>

                  <Card className="order-1 h-fit xl:order-2">
                    <CardContent className="space-y-3 pt-6">
                      <p className="text-sm font-medium">Capa do curso</p>
                      <div className="space-y-2 rounded-lg border border-border/70 p-3">
                        {form.watch('coverImageUrl') ? (
                          <div className="overflow-hidden rounded-md border border-border/70 bg-muted">
                            <img
                              src={form.watch('coverImageUrl')}
                              alt="Pré-visualização da capa"
                              className="h-40 w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                            Nenhuma imagem selecionada
                          </div>
                        )}
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-primary/40 bg-primary/10 text-primary hover:border-primary/60 hover:bg-primary/20"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            {form.watch('coverImageUrl') ? 'Trocar imagem' : 'Selecionar imagem'}
                          </Button>
                          {form.watch('coverImageUrl') ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-destructive/50 bg-destructive/10 text-destructive hover:border-destructive/70 hover:bg-destructive/20"
                              onClick={handleRemoveCover}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {coverUploadError ? <p className="text-xs font-medium text-destructive">{coverUploadError}</p> : null}
                      <p className="text-xs text-muted-foreground">Formatos aceitos: JPEG, PNG, WebP ou GIF (até 3 MB).</p>
                    </CardContent>
                  </Card>
                </div>

                <Button type="submit" isLoading={updateCourse.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" onClick={handleAddModule} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Novo Módulo
              </Button>
            </div>

            <div className="space-y-4">
              {course.modules?.map((mod, index) => (
                <Card key={mod.id} className="border-border">
                  <div className="flex flex-col gap-3 rounded-t-xl border-b border-border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                    <h3 className="flex min-w-0 items-center gap-2 text-base font-bold sm:gap-3 sm:text-lg">
                      <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground/70" aria-hidden />
                      <span className="truncate">
                        Módulo {index + 1}: {mod.title}
                      </span>
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 sm:w-auto"
                      onClick={() => handleAddLesson(mod.id)}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Nova Aula
                    </Button>
                  </div>
                  <div className="bg-card p-3 sm:p-4">
                    {mod.lessons?.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma aula neste módulo.</p>
                    ) : (
                      <div className="space-y-3">
                        {mod.lessons?.map((lesson) => (
                          <LessonEditorRow key={lesson.id} lesson={lesson as Lesson} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {(!course.modules || course.modules.length === 0) && (
                <div className="rounded-xl border-2 border-dashed border-border py-12 text-center text-muted-foreground">
                  Comece adicionando seu primeiro módulo.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
