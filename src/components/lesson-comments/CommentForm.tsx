import { useId, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MAX_COMMENT_LENGTH } from '@/lib/comment-utils';

type CommentFormProps = {
  /** Retorna true quando o campo deve ser limpo (ex.: publicação bem-sucedida). */
  onSubmit: (text: string) => Promise<boolean>;
  submitLabel?: string;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onCancel?: () => void;
  ariaLabel: string;
};

export function CommentForm({
  onSubmit,
  submitLabel = 'Publicar comentário',
  placeholder = 'Escreva seu comentário...',
  initialValue = '',
  autoFocus = false,
  compact = false,
  onCancel,
  ariaLabel,
}: CommentFormProps) {
  const [text, setText] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const textareaId = useId();
  const counterId = useId();

  const trimmedEmpty = text.trim().length === 0;
  const overLimit = text.length > MAX_COMMENT_LENGTH;
  const disabled = submitting || trimmedEmpty || overLimit;

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      const shouldClear = await onSubmit(text);
      if (shouldClear) setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={textareaId} className="sr-only">
        {ariaLabel}
      </label>
      <Textarea
        id={textareaId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={counterId}
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        maxLength={MAX_COMMENT_LENGTH + 200}
        disabled={submitting}
        className="resize-y"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            void handleSubmit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          id={counterId}
          className={cn(
            'text-xs text-muted-foreground',
            overLimit && 'font-medium text-destructive',
          )}
          aria-live="polite"
        >
          {text.length}/{MAX_COMMENT_LENGTH}
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
          )}
          <Button
            type="button"
            size={compact ? 'sm' : 'default'}
            className="bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
            disabled={disabled}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" aria-hidden />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
