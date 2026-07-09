import { useState } from 'react';
import { X } from 'lucide-react';
import {
  GC_SECTION_Y,
  GastroCard,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { GastroHorizontalCarousel } from '@/components/gastrocentro/GastroHorizontalCarousel';
import { specialists, type Specialist } from '@/data/gastrocentro-landing';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const SPECIALIST_SLIDE = 'w-[min(68vw,230px)] shrink-0 snap-start sm:w-[250px]';

function SpecialistCard({
  person,
  onOpen,
}: {
  person: Specialist;
  onOpen: (person: Specialist) => void;
}) {
  const hasBio = Boolean(person.bio?.length);
  const interactive = hasBio;

  const cardContent = (
    <GastroCard
      hover={interactive}
      className={cn(
        'group/spec flex h-full min-w-0 flex-col items-center overflow-hidden !p-0 text-center',
        'border border-gc-navy/20 shadow-[0_8px_32px_-4px_rgba(4,27,58,0.18),0_2px_10px_rgba(4,27,58,0.10)]',
        interactive && 'cursor-pointer hover:border-gc-teal/40',
      )}
    >
      {person.photoSrc ? (
        <div className="w-full px-2.5 pt-2.5">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-gc-text/30 shadow-[0_8px_28px_rgba(8,42,79,0.28)]">
            <img
              src={person.photoSrc}
              alt={person.name}
              loading="lazy"
              decoding="async"
              width={480}
              height={600}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover/spec:scale-[1.03] motion-reduce:group-hover/spec:scale-100"
            />
          </div>
        </div>
      ) : (
        <div className="w-full px-2.5 pt-2.5">
          <span
            className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-gc-text/30 text-xl font-bold text-white shadow-[0_8px_28px_rgba(8,42,79,0.28)]"
            style={{ backgroundColor: person.color }}
            aria-hidden
          >
            {person.initials}
          </span>
        </div>
      )}
      <div className="flex w-full flex-col items-center px-4 py-4 text-center sm:px-5 sm:py-4">
        <h3 className="text-sm font-bold leading-snug text-gc-text sm:text-[15px]">{person.name}</h3>
      </div>
    </GastroCard>
  );

  if (!interactive) {
    return <div className="h-full min-w-0">{cardContent}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(person)}
      onPointerEnter={() => {
        if (!person.photoSrc) return;
        const img = new Image();
        img.src = person.photoSrc;
      }}
      className="block h-full min-w-0 w-full text-left"
      aria-label={`Ver mini currículo de ${person.fullName ?? person.name}`}
    >
      {cardContent}
    </button>
  );
}

function SpecialistBioModal({
  person,
  open,
  onOpenChange,
}: {
  person: Specialist | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!person) return null;

  const displayName = person.fullName ?? person.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          'gc-font gc-specialist-modal',
          /* Centraliza o card no viewport (horizontal + vertical) */
          '!fixed !inset-0 !left-0 !top-0 !z-50 !flex !h-dvh !w-screen !max-w-none',
          '!translate-x-0 !translate-y-0 items-center justify-center',
          '!gap-0 !overflow-y-auto !border-0 !bg-transparent !p-4 !shadow-none sm:!p-6',
          'data-[state=open]:!animate-none data-[state=closed]:!animate-none',
        )}
        overlayClassName="bg-gc-navy/55 backdrop-blur-[2px] data-[state=open]:duration-300"
      >
        <div
          className={cn(
            'gc-specialist-modal-panel relative my-auto w-full max-w-[min(100%,40rem)] overflow-hidden',
            'rounded-[24px] border border-gc-border bg-white',
            'shadow-[0_28px_80px_-18px_rgba(4,27,58,0.42)]',
          )}
        >
          <DialogClose
            className="absolute right-4 top-4 z-10 rounded-full bg-gc-ice/95 p-2 text-gc-text opacity-90 shadow-sm transition-opacity hover:bg-white hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gc-teal focus:ring-offset-2"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </DialogClose>

          <div className="flex flex-col sm:flex-row sm:items-stretch">
            {person.photoSrc ? (
              <div className="relative mx-auto mt-7 h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-2 border-gc-text/20 shadow-[0_10px_28px_rgba(8,42,79,0.2)] sm:mx-0 sm:mt-0 sm:h-auto sm:min-h-[280px] sm:w-[13.5rem] sm:rounded-none sm:rounded-l-[24px] sm:border-0 sm:border-r sm:border-gc-border">
                <img
                  src={person.photoSrc}
                  alt=""
                  decoding="async"
                  fetchPriority="high"
                  width={480}
                  height={600}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col px-7 pb-7 pt-6 sm:px-9 sm:pb-9 sm:pt-8">
              <DialogHeader className="space-y-2.5 text-left">
                <DialogTitle className="pr-10 text-[1.2rem] font-bold leading-snug text-gc-text sm:text-[1.35rem]">
                  {displayName}
                </DialogTitle>
                <DialogDescription className="sr-only">Mini currículo profissional</DialogDescription>
              </DialogHeader>

              {person.bio?.length ? (
                <ul className="mt-6 space-y-3 border-t border-gc-border/80 pt-6">
                  {person.bio.map((item) => (
                    <li
                      key={item}
                      className="relative pl-4 text-[14px] leading-relaxed text-gc-gray-text sm:text-[15px]"
                    >
                      <span
                        className="absolute left-0 top-[0.55em] h-1.5 w-1.5 rounded-full bg-gc-coral"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SpecialistsSection() {
  const [selected, setSelected] = useState<Specialist | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (person: Specialist) => {
    setSelected(person);
    setOpen(true);
  };

  return (
    <GastroSection id="especialistas" className={cn('bg-white', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Aprenda com médicos de referência"
          subtitle="Corpo docente altamente qualificado e com ampla experiência clínica. Clique no card para ver o mini currículo."
        />

        <div className="relative overflow-visible">
          <GastroHorizontalCarousel
            slideCount={specialists.length}
            showIndicators={false}
            aria-label="Carrossel do corpo docente"
          >
            {specialists.map((person) => (
              <div key={person.id} data-carousel-slide className={SPECIALIST_SLIDE}>
                <SpecialistCard person={person} onOpen={handleOpen} />
              </div>
            ))}
          </GastroHorizontalCarousel>
        </div>
      </GastroContainer>

      <SpecialistBioModal person={selected} open={open} onOpenChange={setOpen} />
    </GastroSection>
  );
}
