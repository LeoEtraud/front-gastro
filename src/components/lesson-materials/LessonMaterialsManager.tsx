import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Loader2,
  Presentation,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import {
  useDeleteLessonMaterial,
  useReorderLessonMaterials,
  useReplaceLessonMaterialFile,
  useTeacherLessonMaterials,
  useUpdateLessonMaterialTitle,
  useUploadLessonMaterial,
} from '@/hooks/use-lesson-materials';
import {
  formatFileSize,
  formatMaterialExtension,
  isPdfExtension,
  isPowerPointExtension,
  LESSON_MATERIAL_ACCEPT,
} from '@/lib/lesson-materials-utils';
import type { LessonMaterial } from '@/types/api';

function MaterialIcon({ extension }: { extension: string }) {
  if (isPdfExtension(extension)) {
    return <FileText className="h-5 w-5 shrink-0 text-red-600" aria-hidden />;
  }
  if (isPowerPointExtension(extension)) {
    return <Presentation className="h-5 w-5 shrink-0 text-orange-600" aria-hidden />;
  }
  return <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type LessonMaterialsManagerProps = {
  lessonId: string;
  readOnly?: boolean;
};

export function LessonMaterialsManager({ lessonId, readOnly = false }: LessonMaterialsManagerProps) {
  const { data, isLoading } = useTeacherLessonMaterials(lessonId, !readOnly);
  const uploadMaterial = useUploadLessonMaterial(lessonId);
  const replaceMaterial = useReplaceLessonMaterialFile(lessonId);
  const updateTitle = useUpdateLessonMaterialTitle(lessonId);
  const reorderMaterials = useReorderLessonMaterials(lessonId);
  const deleteMaterial = useDeleteLessonMaterial(lessonId);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [newTitle, setNewTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [replaceProgress, setReplaceProgress] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LessonMaterial | null>(null);

  const materials = data?.materials ?? [];
  const limits = data?.limits;
  const isBusy =
    uploadMaterial.isPending ||
    replaceMaterial.isPending ||
    updateTitle.isPending ||
    reorderMaterials.isPending ||
    deleteMaterial.isPending;

  const handleUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      await uploadMaterial.mutateAsync({
        file,
        title: newTitle,
        onProgress: setUploadProgress,
      });
      setNewTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({ variant: 'success', title: 'Material enviado com sucesso' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast({
        variant: 'destructive',
        title: 'Falha no upload',
        description: ax?.response?.data?.error || 'Tente novamente.',
      });
    } finally {
      setUploadProgress(null);
    }
  };

  const handleReplace = async (materialId: string, file: File) => {
    try {
      setReplaceProgress(0);
      await replaceMaterial.mutateAsync({
        materialId,
        file,
        onProgress: setReplaceProgress,
      });
      toast({ variant: 'success', title: 'Arquivo substituído com sucesso' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast({
        variant: 'destructive',
        title: 'Falha ao substituir arquivo',
        description: ax?.response?.data?.error || 'O arquivo anterior foi preservado.',
      });
    } finally {
      setReplacingId(null);
      setReplaceProgress(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleSaveTitle = async (materialId: string) => {
    try {
      await updateTitle.mutateAsync({ materialId, title: editingTitle });
      setEditingId(null);
      toast({ variant: 'success', title: 'Título atualizado' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar título',
        description: ax?.response?.data?.error,
      });
    }
  };

  const moveMaterial = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= materials.length) return;
    const orderedIds = materials.map((item) => item.id);
    [orderedIds[index], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[index]];
    try {
      await reorderMaterials.mutateAsync(orderedIds);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao reordenar materiais' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMaterial.mutateAsync(deleteTarget.id);
      toast({ variant: 'success', title: 'Material excluído' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir material',
        description: ax?.response?.data?.error,
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (readOnly) return null;

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Materiais Complementares</h4>
        {limits ? (
          <p className="mt-1 text-xs text-muted-foreground">{limits.guidanceText}</p>
        ) : null}
      </div>

      <div className="space-y-3 rounded-lg border border-dashed border-border bg-card p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Título de exibição (opcional)</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex.: Slides da aula 1"
              className="h-9"
              disabled={isBusy}
            />
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept={LESSON_MATERIAL_ACCEPT}
              className="hidden"
              disabled={isBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadMaterial.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Enviar material
            </Button>
          </div>
        </div>
        {uploadProgress !== null ? (
          <div className="space-y-1">
            <Progress value={uploadProgress} />
            <p className="text-xs text-muted-foreground">Enviando... {uploadProgress}%</p>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando materiais...
        </div>
      ) : null}

      {!isLoading && materials.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Nenhum material anexado a esta aula.
        </p>
      ) : null}

      <div className="space-y-2">
        {materials.map((material, index) => (
          <div
            key={material.id}
            className="rounded-lg border border-border bg-card p-3 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <MaterialIcon extension={material.fileExtension} />
                <div className="min-w-0 flex-1 space-y-1">
                  {editingId === material.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8"
                        disabled={updateTitle.isPending}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleSaveTitle(material.id)}
                        isLoading={updateTitle.isPending}
                      >
                        Salvar
                      </Button>
                    </div>
                  ) : (
                    <p className="truncate text-sm font-medium text-foreground">{material.title}</p>
                  )}
                  <p className="truncate text-xs text-muted-foreground">{material.originalFileName}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{formatMaterialExtension(material.fileExtension)}</span>
                    <span>{formatFileSize(material.fileSize)}</span>
                    <span>{formatDate(material.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 self-end sm:self-start">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isBusy || index === 0}
                  onClick={() => void moveMaterial(index, -1)}
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isBusy || index === materials.length - 1}
                  onClick={() => void moveMaterial(index, 1)}
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="cancel"
                  disabled={isBusy}
                  onClick={() => {
                    setEditingId(material.id);
                    setEditingTitle(material.title);
                  }}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="cancel"
                  disabled={isBusy}
                  onClick={() => {
                    setReplacingId(material.id);
                    replaceInputRef.current?.click();
                  }}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Substituir
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => setDeleteTarget(material)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
            {replacingId === material.id && replaceProgress !== null ? (
              <div className="mt-3 space-y-1">
                <Progress value={replaceProgress} />
                <p className="text-xs text-muted-foreground">Substituindo arquivo... {replaceProgress}%</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <input
        ref={replaceInputRef}
        type="file"
        accept={LESSON_MATERIAL_ACCEPT}
        className="hidden"
        disabled={isBusy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replacingId) void handleReplace(replacingId, file);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir material</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.title}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMaterial.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMaterial.isPending}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleteMaterial.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
