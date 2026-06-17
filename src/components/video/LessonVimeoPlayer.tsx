import { Loader2 } from 'lucide-react';
import { VimeoPlayer } from '@/components/video/VimeoPlayer';
import { useLessonVideo } from '@/hooks/use-lesson-video';

type LessonVimeoPlayerProps = {
  courseId: string;
  lessonId: string;
  active?: boolean;
  className?: string;
};

/** Busca dados do Vimeo via API autenticada e renderiza o iframe apenas para alunos autorizados. */
export function LessonVimeoPlayer({
  courseId,
  lessonId,
  active = true,
  className,
}: LessonVimeoPlayerProps) {
  const { data, isLoading, isError } = useLessonVideo(courseId, lessonId, active);

  if (!active) return null;

  if (isLoading) {
    return (
      <div className={`relative aspect-video w-full shrink-0 bg-black/85 ${className ?? ''}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      </div>
    );
  }

  if (isError || !data?.vimeoVideoId) {
    return (
      <div className={`relative flex aspect-video w-full shrink-0 items-center justify-center bg-muted px-6 text-center ${className ?? ''}`}>
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar o vídeo. Verifique sua conexão ou entre em contato com o suporte.
        </p>
      </div>
    );
  }

  return (
    <VimeoPlayer
      vimeoVideoId={data.vimeoVideoId}
      embedUrl={data.embedUrl}
      active
      className={className}
    />
  );
}
