import { cn } from '@/lib/utils';
import { buildVimeoPlayerSrc } from '@/lib/vimeo';

export type VimeoPlayerProps = {
  vimeoVideoId?: string | null;
  embedUrl?: string | null;
  title?: string;
  className?: string;
  /** Quando false, não renderiza o iframe (lazy load). */
  active?: boolean;
};

/**
 * Player Vimeo responsivo 16:9. Não expõe credenciais — apenas o ID público do embed.
 */
export function VimeoPlayer({
  vimeoVideoId,
  embedUrl,
  title = 'Vídeo da aula',
  className,
  active = true,
}: VimeoPlayerProps) {
  if (!active || !vimeoVideoId) return null;

  const base = embedUrl?.trim() || `https://player.vimeo.com/video/${vimeoVideoId}`;
  const separator = base.includes('?') ? '&' : '?';
  const src = base.includes('title=')
    ? base
    : `${base}${separator}title=0&byline=0&portrait=0`;

  return (
    <div className={cn('relative w-full overflow-hidden bg-black', className)} style={{ paddingTop: '56.25%' }}>
      <iframe
        src={src}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

/** Variante admin com src já montado (preview local). */
export function VimeoPlayerById({
  videoId,
  className,
  active = true,
}: {
  videoId: string;
  className?: string;
  active?: boolean;
}) {
  if (!active) return null;
  return (
    <div className={cn('relative w-full overflow-hidden bg-black', className)} style={{ paddingTop: '56.25%' }}>
      <iframe
        src={buildVimeoPlayerSrc(videoId)}
        title="Vídeo da aula"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
