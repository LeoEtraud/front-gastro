import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useTeacherCourse,
  useUpdateCourse,
  useSetCourseStatus,
  useUpdateLesson,
  useDeleteLesson,
  useDeleteModule,
} from '@/hooks/use-teacher';
import type { Lesson } from '@/types/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { canManageCourseStructure, canPublishCourse } from '@/lib/permissions';
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
import {
  Plus,
  GripVertical,
  Upload,
  Trash2,
  ImagePlus,
  BookCheck,
  Save,
  Info,
  ArrowLeft,
  CircleChevronDown,
  Pencil,
  MoreHorizontal,
  Link2,
} from 'lucide-react';
import { Accordion } from '@heroui/react';
import type { Key } from '@heroui/react';
import { useToast } from '@/hooks/use-toast';
import {
  CreateLessonModal,
  CreateModuleModal,
  EditModuleModal,
} from '@/components/course-management/create-entity-modals';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEDICAL_SPECIALTIES } from '@/lib/medical-specialties';
import { uploadCourseCoverFile } from '@/lib/course-cover-upload';
import { uploadLessonVideo, resolveLessonVideoMimeType } from '@/lib/lesson-video-upload';
import { HlsVideoPlayer } from '@/components/video/HlsVideoPlayer';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

/**
 * Estilos do badge de status do vídeo da aula. Mantém legibilidade e
 * coerência com os tokens do projeto, sem cores chamativas no estado padrão.
 */
function lessonSourceBadgeClass(status: 'hosted' | 'external' | 'none'): string {
  if (status === 'hosted') {
    return 'border-emerald-300/70 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300';
  }
  if (status === 'external') {
    return 'border-blue-300/70 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300';
  }
  return 'border-border/60 bg-muted/60 text-muted-foreground';
}

// COMPONENTE PARA EDITAR UMA AULA — linha compacta + área expansível.
function LessonEditorRow({
  lesson,
  courseId,
  readOnly = false,
}: {
  lesson: Lesson;
  courseId: string;
  readOnly?: boolean;
}) {
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef<string | null>(null);
  const [externalUrl, setExternalUrl] = useState(lesson.videoUrl ?? '');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);
  const [isDeleteVideoDialogOpen, setIsDeleteVideoDialogOpen] = useState(false);
  const [isDeleteLessonDialogOpen, setIsDeleteLessonDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string | null>(null);
  const LESSON_ACCORDION_KEY = 'lesson';
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set());
  const isExpanded = expandedKeys.has(LESSON_ACCORDION_KEY);
  const setIsExpanded = (open: boolean) => {
    setExpandedKeys(open ? new Set<Key>([LESSON_ACCORDION_KEY]) : new Set<Key>());
  };
  const [videoSourceTab, setVideoSourceTab] = useState<'hosted' | 'external'>('hosted');

  useEffect(() => {
    if (lesson.videoObjectKey) {
      setExternalUrl('');
    } else {
      setExternalUrl(lesson.videoUrl ?? '');
    }
  }, [lesson.id, lesson.videoUrl, lesson.videoObjectKey]);

  // Quando a aula tem link externo, abrimos a aba correspondente por padrão.
  useEffect(() => {
    if (!lesson.videoObjectKey && lesson.videoUrl) {
      setVideoSourceTab('external');
    } else {
      setVideoSourceTab('hosted');
    }
  }, [lesson.id, lesson.videoObjectKey, lesson.videoUrl]);

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
  const hasAnyVideo = hasHosted || hasExternal;
  const previewUrl = localVideoPreviewUrl || lesson.videoPlaybackUrl || (!hasHosted ? lesson.videoUrl : null) || null;
  const busy = isUploading || (updateLesson.isPending && !isRemovingVideo);
  const sourceStatus: 'hosted' | 'external' | 'none' = hasHosted ? 'hosted' : hasExternal ? 'external' : 'none';
  const sourceLabel = hasHosted ? 'Hospedado' : hasExternal ? 'Link externo' : 'Sem vídeo';
  const durationLabel = lesson.duration ? formatDuration(lesson.duration) : null;

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
    try {
      resolveLessonVideoMimeType(file);
    } catch {
      toast({ variant: 'destructive', title: 'Selecione um arquivo de vídeo (MP4, WebM ou MOV)' });
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      // Lê metadados locais (duração, resolução) antes do upload para persistir no backend
      const localMeta = await extractLocalVideoMetadata(file);
      const { objectKey, contentType: uploadedContentType } = await uploadLessonVideo({
        lessonId: lesson.id,
        file,
        onProgress: (percent) => setUploadProgress(percent),
      });
      await updateLesson.mutateAsync({
        id: lesson.id,
        data: {
          type: 'VIDEO',
          videoObjectKey: objectKey,
          videoSizeBytes: file.size,
          videoContentType: uploadedContentType || file.type || null,
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
        description:
          ax?.response?.data?.error ||
          ax?.message ||
          'Verifique as variáveis S3/R2 no servidor e o limite de tamanho do upload.',
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

  const onDeleteLesson = async () => {
    try {
      await deleteLesson.mutateAsync({ id: lesson.id, courseId });
      toast({ variant: 'success', title: 'Aula excluída com sucesso' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } }; message?: string };
      toast({
        variant: 'destructive',
        title: 'Falha ao excluir aula',
        description: ax?.response?.data?.error || ax?.message,
      });
    }
  };

  return (
    <>
      <Accordion
        expandedKeys={expandedKeys}
        onExpandedChange={(keys) => setExpandedKeys(keys as Set<Key>)}
        variant="surface"
        className={cn(
          'rounded-lg border border-border bg-card transition-colors',
          isExpanded && 'border-primary/40',
        )}
      >
        <Accordion.Item id={LESSON_ACCORDION_KEY}>
          {/* Cabeçalho minimalista: apenas título + status + indicador de expandir/recolher */}
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center gap-3 px-3 py-2.5 text-left sm:px-4 sm:py-3">
              <span className="truncate text-sm font-medium text-foreground">{lesson.title}</span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  lessonSourceBadgeClass(sourceStatus),
                )}
              >
                {sourceLabel}
              </span>

              <Accordion.Indicator className="ml-auto shrink-0 text-muted-foreground">
                <CircleChevronDown className="h-5 w-5" />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>

          {/* Área expandida — edição de mídia + menu único de ações da aula */}
          <Accordion.Panel>
            <Accordion.Body className="border-t border-border/70 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
              {readOnly ? (
                previewUrl ? (
                  <div className="w-full max-w-md overflow-hidden rounded-md bg-black/90">
                    <HlsVideoPlayer
                      src={previewUrl}
                      controls
                      preload="metadata"
                      active
                      className="aspect-video w-full"
                      videoClassName="aspect-video w-full"
                    />
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground sm:text-sm">
                    Nenhum vídeo disponível para esta aula.
                  </p>
                )
              ) : null}
              {!readOnly ? (
              <>
              <input
                type="file"
                ref={fileRef}
                accept="video/mp4,video/webm,video/quicktime,video/*"
                className="hidden"
                onChange={onFileChange}
              />

              <Tabs
                value={videoSourceTab}
                onValueChange={(value) => setVideoSourceTab(value as 'hosted' | 'external')}
                className="space-y-3"
              >
                {/*
                 * Linha de cabeçalho do painel: abas (Vídeo hospedado / Link externo) à esquerda
                 * e o menu único de ações da aula alinhado à direita.
                 */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <TabsList className="grid w-full grid-cols-2 sm:max-w-sm">
                    <TabsTrigger value="hosted" className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Vídeo hospedado
                    </TabsTrigger>
                    <TabsTrigger value="external" className="gap-1.5">
                      <Link2 className="h-3.5 w-3.5" />
                      Link externo
                    </TabsTrigger>
                  </TabsList>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Mais ações da aula"
                        title="Mais ações"
                        className="self-end border-transparent bg-[#B2B3BD] text-white shadow-sm shadow-[#B2B3BD]/30 hover:bg-[#9C9DA8] focus-visible:ring-[#B2B3BD] sm:self-auto"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                        Ações da aula
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={busy}
                        onSelect={() => {
                          setVideoSourceTab('hosted');
                          fileRef.current?.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {hasHosted ? 'Trocar vídeo' : 'Enviar vídeo'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!hasHosted}
                        onSelect={() => {
                          if (!hasHosted) return;
                          setIsInfoDialogOpen(true);
                        }}
                      >
                        <Info className="mr-2 h-4 w-4" />
                        Informações do vídeo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!hasAnyVideo}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onSelect={() => {
                          if (!hasAnyVideo) return;
                          setIsDeleteVideoDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover vídeo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onSelect={() => setIsDeleteLessonDialogOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir aula
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <TabsContent value="hosted" className="space-y-3">
                  {uploadProgress !== null && (
                    <div className="space-y-1.5 rounded-md border border-border/70 bg-muted/40 p-2.5">
                      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span>Enviando vídeo...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2.5" />
                    </div>
                  )}

                  {previewUrl ? (
                    <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-2.5">
                      <p className="text-xs font-medium text-muted-foreground">Pré-visualização do vídeo</p>
                      <div className="w-full max-w-md overflow-hidden rounded-md bg-black/90">
                        <HlsVideoPlayer
                          src={previewUrl}
                          controls
                          preload="metadata"
                          active
                          className="aspect-video w-full"
                          videoClassName="aspect-video w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground sm:text-sm">
                      Nenhum vídeo hospedado para esta aula. Use o menu de ações para enviar um vídeo.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="external" className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1 min-w-0">
                      <label className="text-xs font-medium text-muted-foreground">
                        Link externo (ex.: YouTube)
                      </label>
                      <Input
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={onSaveExternal}
                      isLoading={updateLesson.isPending}
                      className="sm:shrink-0"
                    >
                      Salvar link
                    </Button>
                  </div>
                  {hasHosted ? (
                    <p className="text-xs text-muted-foreground">
                      Salvar um link externo substitui o vídeo hospedado nesta aula (o arquivo antigo pode permanecer no
                      armazenamento até você apagá-lo manualmente).
                    </p>
                  ) : null}
                </TabsContent>
              </Tabs>
              </>
              ) : null}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {!readOnly ? (
      <>
      {/* Diálogo: confirmar exclusão do vídeo */}
      <AlertDialog open={isDeleteVideoDialogOpen} onOpenChange={setIsDeleteVideoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vídeo da aula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o vídeo desta aula? A reprodução ficará indisponível para os alunos até que
              um novo vídeo seja enviado ou um link externo seja informado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingVideo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (event) => {
                event.preventDefault();
                await onDeleteVideo();
                setIsDeleteVideoDialogOpen(false);
              }}
              disabled={isRemovingVideo}
            >
              {isRemovingVideo ? 'Removendo...' : 'Remover vídeo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: confirmar exclusão da aula */}
      <AlertDialog open={isDeleteLessonDialogOpen} onOpenChange={setIsDeleteLessonDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aula <strong>“{lesson.title}”</strong>? Esta ação não pode ser desfeita e
              o conteúdo deixará de aparecer para os alunos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLesson.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (event) => {
                event.preventDefault();
                await onDeleteLesson();
                setIsDeleteLessonDialogOpen(false);
              }}
              disabled={deleteLesson.isPending}
            >
              {deleteLesson.isPending ? 'Excluindo...' : 'Excluir aula'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo: informações detalhadas do vídeo hospedado */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden bg-card p-0 sm:max-w-[640px]">
          <DialogHeader className="shrink-0 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
            <div className="space-y-1.5 pr-10 sm:pr-12">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                  <Info className="h-4 w-4" />
                </span>
                Informações do vídeo
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Metadados do arquivo enviado para esta aula.
              </DialogDescription>
            </div>
            <Separator className="mt-3" />
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-background p-3.5 dark:bg-background/40">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Data de publicação
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-foreground">
                  {formatDateTime(lesson.videoUploadedAt)}
                </dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-background p-3.5 dark:bg-background/40">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tamanho do arquivo
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-foreground">{formatFileSize(lesson.videoSizeBytes)}</dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-background p-3.5 dark:bg-background/40">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Qualidade do vídeo
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-foreground">
                  {formatVideoQuality(lesson.videoHeight, lesson.videoWidth, lesson.videoContentType)}
                </dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-background p-3.5 dark:bg-background/40">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duração</dt>
                <dd className="mt-1.5 text-sm font-semibold text-foreground">{formatDuration(lesson.duration)}</dd>
              </div>
            </dl>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-card px-5 py-4 sm:px-6">
            <Button
              type="button"
              onClick={() => setIsInfoDialogOpen(false)}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
      ) : null}
    </>
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
  const { user } = useAuth();
  const { data: course, isLoading, isError, error, refetch, isRefetching } = useTeacherCourse(id!);
  const canStructure = user ? canManageCourseStructure(user.role) : false;
  const canPublish = user ? canPublishCourse(user.role) : false;
  const showLoading = useDelayedFlag(isLoading);
  const updateCourse = useUpdateCourse();
  const setCourseStatus = useSetCourseStatus();
  const deleteModule = useDeleteModule();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'modules'>('modules');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<string | undefined>(undefined);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  type ModuleSummary = { id: string; title: string; description?: string | null };
  const [moduleToEdit, setModuleToEdit] = useState<ModuleSummary | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleSummary | null>(null);

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
  const handleEditModule = (mod: ModuleSummary) => setModuleToEdit(mod);
  const handleRequestDeleteModule = (mod: ModuleSummary) => setModuleToDelete(mod);
  const handleConfirmDeleteModule = async () => {
    if (!moduleToDelete || !id) return;
    try {
      await deleteModule.mutateAsync({ id: moduleToDelete.id, courseId: id });
      toast({ variant: 'success', title: 'Módulo excluído com sucesso' });
      setModuleToDelete(null);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } }; message?: string };
      toast({
        variant: 'destructive',
        title: 'Falha ao excluir módulo',
        description: ax?.response?.data?.error || ax?.message,
      });
    }
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
      <EditModuleModal
        open={!!moduleToEdit}
        onOpenChange={(open) => {
          if (!open) setModuleToEdit(null);
        }}
        module={moduleToEdit}
        courseId={id!}
      />
      <AlertDialog
        open={!!moduleToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteModule.isPending) setModuleToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir módulo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o módulo <strong>“{moduleToDelete?.title}”</strong>? Todas as aulas
              vinculadas a este módulo serão removidas em definitivo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteModule.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDeleteModule();
              }}
              disabled={deleteModule.isPending}
            >
              {deleteModule.isPending ? 'Excluindo...' : 'Excluir módulo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          {canPublish ? (
            <Button
              className={cn(
                course.status === 'PUBLISHED'
                  ? 'w-full shrink-0 sm:w-auto bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-600 border-transparent'
                  : 'w-full shrink-0 sm:w-auto bg-[#1D8035] text-white hover:bg-[#176C2C] focus-visible:ring-[#1D8035] border-transparent',
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
          ) : null}
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
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 basis-32 sm:max-w-[11rem] bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            {form.watch('coverImageUrl') ? 'Trocar imagem' : 'Selecionar imagem'}
                          </Button>
                          {form.watch('coverImageUrl') ? (
                            <Button
                              type="button"
                              size="sm"
                              className="flex-1 basis-32 sm:max-w-[11rem] bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">Estrutura do curso</h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {canStructure
                    ? 'Organize módulos e aulas. Expanda uma aula para gerenciar o vídeo pelo menu de ações.'
                    : 'Visualize módulos e aulas. Expanda uma aula para assistir ao vídeo.'}
                </p>
              </div>
              {canStructure ? (
                <Button
                  type="button"
                  onClick={handleAddModule}
                  className="w-full bg-primary text-primary-foreground shadow-sm shadow-primary/30 hover:bg-primary/90 sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" /> Novo Módulo
                </Button>
              ) : null}
            </div>

            <div className="space-y-4">
              {course.modules?.map((mod, index) => {
                const lessonsCount = mod.lessons?.length ?? 0;
                return (
                  <Card key={mod.id} className="overflow-hidden border-border">
                    <div className="flex flex-col gap-3 border-b border-primary/20 bg-primary/10 px-4 py-3 dark:border-primary/30 dark:bg-primary/15 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <GripVertical
                          className="h-5 w-5 shrink-0 cursor-grab text-primary/70"
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-foreground sm:text-lg">
                            <span className="truncate">
                              <span className="text-primary">Módulo {index + 1}:</span> {mod.title}
                            </span>
                          </h3>
                          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">
                            {lessonsCount === 0
                              ? 'Nenhuma aula'
                              : lessonsCount === 1
                                ? '1 aula'
                                : `${lessonsCount} aulas`}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        {canStructure ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="border-transparent bg-[#B2B3BD] text-white shadow-sm shadow-[#B2B3BD]/30 hover:bg-[#9C9DA8] focus-visible:ring-[#B2B3BD]"
                              aria-label="Mais ações do módulo"
                              title="Mais ações"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                              Ações do módulo
                            </DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleAddLesson(mod.id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Nova aula
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleEditModule({
                                  id: mod.id,
                                  title: mod.title,
                                  description: mod.description,
                                })
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar módulo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onSelect={() =>
                                handleRequestDeleteModule({
                                  id: mod.id,
                                  title: mod.title,
                                  description: mod.description,
                                })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir módulo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        ) : null}
                      </div>
                    </div>
                    <div className="bg-card p-3 sm:p-4">
                      {lessonsCount === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">Nenhuma aula neste módulo.</p>
                          {canStructure ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddLesson(mod.id)}
                            >
                              <Plus className="mr-1 h-4 w-4" /> Adicionar primeira aula
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {mod.lessons?.map((lesson) => (
                            <LessonEditorRow
                              key={lesson.id}
                              lesson={lesson as Lesson}
                              courseId={id!}
                              readOnly={!canStructure}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              {(!course.modules || course.modules.length === 0) && (
                <div className="rounded-xl border-2 border-dashed border-border py-12 text-center text-muted-foreground">
                  {canStructure
                    ? 'Comece adicionando seu primeiro módulo.'
                    : 'Este curso ainda não possui módulos cadastrados.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
