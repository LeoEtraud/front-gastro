import { useState } from 'react';
import { ChevronDown, Download, FileText, Loader2, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import {
  downloadStudentLessonMaterial,
  useStudentLessonMaterials,
} from '@/hooks/use-lesson-materials';
import {
  formatFileSize,
  formatMaterialExtension,
  isPdfExtension,
  isPowerPointExtension,
} from '@/lib/lesson-materials-utils';
import { cn } from '@/lib/utils';

function MaterialIcon({ extension }: { extension: string }) {
  if (isPdfExtension(extension)) {
    return <FileText className="h-5 w-5 shrink-0 text-red-600" aria-hidden />;
  }
  if (isPowerPointExtension(extension)) {
    return <Presentation className="h-5 w-5 shrink-0 text-orange-600" aria-hidden />;
  }
  return <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />;
}

type LessonMaterialsSectionProps = {
  lessonId: string;
};

export function LessonMaterialsSection({ lessonId }: LessonMaterialsSectionProps) {
  const { data: materials, isLoading } = useStudentLessonMaterials(lessonId);
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (isLoading) return null;
  if (!materials || materials.length === 0) return null;

  const handleDownload = async (materialId: string, title: string, originalFileName: string) => {
    if (downloadingId) return;
    setDownloadingId(materialId);
    try {
      await downloadStudentLessonMaterial(lessonId, materialId, originalFileName || title);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string }; status?: number } };
      toast({
        variant: 'destructive',
        title: ax?.response?.status === 404 ? 'Arquivo indisponível' : 'Erro ao baixar material',
        description: ax?.response?.data?.error || 'Tente novamente em instantes.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-8">
      <div className="rounded-xl border border-border bg-card">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-4"
          >
            <div>
              <h3 className="font-display text-base font-semibold text-card-foreground sm:text-lg">
                Materiais Complementares
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {materials.length} {materials.length === 1 ? 'arquivo disponível' : 'arquivos disponíveis'}
              </p>
            </div>
            <ChevronDown
              className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-4 py-4 sm:px-5">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-3 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <MaterialIcon extension={material.fileExtension} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{material.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMaterialExtension(material.fileExtension)} · {formatFileSize(material.fileSize)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full border-transparent bg-slate-700 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 sm:w-auto"
                  disabled={downloadingId === material.id}
                  onClick={() =>
                    void handleDownload(material.id, material.title, material.originalFileName)
                  }
                >
                  {downloadingId === material.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" aria-hidden />
                      Baixar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
