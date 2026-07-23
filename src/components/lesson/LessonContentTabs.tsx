import { useEffect, useState } from 'react';
import { Info, Loader2, MessageSquareText, Paperclip } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LessonMaterialsSection } from '@/components/lesson-materials/LessonMaterialsSection';
import { LessonCommentsSection } from '@/components/lesson-comments/LessonCommentsSection';
import { useStudentLessonMaterials } from '@/hooks/use-lesson-materials';
import { normalizePtBrText } from '@/lib/normalize-ptbr';
import { cn } from '@/lib/utils';
import type { LessonWithProgress } from '@/types/api';

type LessonTab = 'about' | 'materials' | 'comments';

type LessonContentTabsProps = {
  lesson: LessonWithProgress;
  lessonId: string;
};

const tabTriggerClass = cn(
  'relative h-auto flex-none gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none',
  'hover:text-foreground',
  'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none',
  'focus-visible:ring-0 focus-visible:ring-offset-0',
);

export function LessonContentTabs({ lesson, lessonId }: LessonContentTabsProps) {
  const [tab, setTab] = useState<LessonTab>('about');
  const { data: materials, isLoading: materialsLoading } = useStudentLessonMaterials(lessonId);
  const materialsCount = materials?.length ?? 0;

  useEffect(() => {
    setTab('about');
  }, [lessonId]);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as LessonTab)}
      className="mt-2 w-full min-w-0"
    >
      <TabsList
        className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-transparent p-0"
        aria-label="Conteúdo da aula"
      >
        <TabsTrigger value="about" className={tabTriggerClass}>
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          Sobre a aula
        </TabsTrigger>
        <TabsTrigger value="materials" className={tabTriggerClass}>
          <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
          Materiais
          {!materialsLoading && materialsCount > 0 && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {materialsCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="comments" className={tabTriggerClass}>
          <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden />
          Comentários
        </TabsTrigger>
      </TabsList>

      <TabsContent value="about" className="mt-5 focus-visible:ring-0">
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none text-card-foreground/90 prose-headings:text-card-foreground prose-p:text-card-foreground/90 sm:prose-base dark:prose-invert">
            {lesson.description ? (
              <p>{normalizePtBrText(lesson.description)}</p>
            ) : (
              <p className="italic text-muted-foreground">Nenhuma descrição adicional para esta aula.</p>
            )}
          </div>

          {lesson.type === 'QUIZ' && lesson.quiz && (
            <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-center sm:p-6">
              <h3 className="mb-2 text-lg font-bold text-card-foreground sm:text-xl">
                {normalizePtBrText(lesson.quiz.title)}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground sm:mb-6 sm:text-base">
                Avaliação com {lesson.quiz.questions.length} questões. Nota para passar:{' '}
                {lesson.quiz.passingScore}%
              </p>
              <Button className="w-full sm:w-auto">Iniciar Avaliação</Button>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="materials" className="mt-5 focus-visible:ring-0">
        {materialsLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Carregando materiais...
          </div>
        ) : (
          <LessonMaterialsSection lessonId={lessonId} embedded />
        )}
      </TabsContent>

      <TabsContent value="comments" className="mt-5 focus-visible:ring-0">
        {lessonId ? <LessonCommentsSection lessonId={lessonId} embedded /> : null}
      </TabsContent>
    </Tabs>
  );
}
