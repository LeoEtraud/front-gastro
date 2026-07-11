import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Banner de boas-vindas — espelha o cartão superior de `SingleCourseHomeExperience`. */
function SingleCourseWelcomeBannerSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card via-gc-ice/90 to-primary/[0.06] shadow-sm dark:from-card dark:via-muted/80 dark:to-primary/10">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <div className="flex flex-1 flex-col justify-center border-b border-border/40 px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 sm:py-6">
          <Skeleton className="h-8 w-56 sm:h-9 md:h-10" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
          <Skeleton className="mt-1.5 h-4 w-full max-w-sm" />
        </div>
        <div className="flex min-h-36 shrink-0 self-stretch overflow-hidden bg-gradient-to-br from-primary/[0.04] to-gc-teal/[0.06] sm:min-h-0 sm:w-44 md:w-52 lg:w-60">
          <Skeleton className="h-full min-h-0 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

/** Grade de 4 cards informativos horizontais (ícone à esquerda, texto à direita). */
function SingleCourseInfoCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 [&>*]:h-full [&>*]:min-w-0">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={`info-${index}`} className="h-full border-border/80">
          <CardContent className="flex min-h-[7.5rem] flex-col gap-2 p-3 sm:min-h-[8rem] sm:flex-row sm:items-center sm:gap-3 sm:p-4">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full sm:h-10 sm:w-10" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
              <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
              <Skeleton className="h-2.5 w-24 sm:h-3" />
              {index === 0 ? <Skeleton className="mt-0.5 h-1 w-full rounded-full" /> : null}
              <Skeleton className="h-2 w-28 sm:h-2.5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Carrossel horizontal de cards de aula empilhados (mídia 16:9 + corpo). */
function SingleCourseLessonCarouselSkeleton() {
  return (
    <section className="space-y-2 sm:space-y-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <Skeleton className="h-6 w-32 sm:h-7" />
          <Skeleton className="h-6 w-40 sm:h-7" />
        </div>
        <Skeleton className="h-4 w-36 shrink-0" />
      </div>
      <div className="-ml-3 flex gap-3 overflow-hidden pl-3 sm:-ml-4 sm:gap-4 sm:pl-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`lesson-${index}`}
            className="min-w-0 shrink-0 basis-[88%] min-[420px]:basis-[62%] sm:basis-[48%] md:basis-[38%] lg:basis-[28%] xl:basis-1/4"
          >
            <div className="overflow-hidden rounded-[22px] border border-border/80">
              <Skeleton className="aspect-video min-h-[11.5rem] w-full rounded-none sm:min-h-[13rem]" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Skeleton do dashboard do aluno com experiência de curso único —
 * espelha `SingleCourseHomeExperience` (banner, 4 cards informativos, carrossel de aulas).
 */
export function StudentDashboardSkeleton() {
  return (
    <div className="mx-auto min-w-0 max-w-[92rem] space-y-4 sm:space-y-5">
      <SingleCourseWelcomeBannerSkeleton />
      <SingleCourseInfoCardsSkeleton />
      <SingleCourseLessonCarouselSkeleton />
    </div>
  );
}

/** Carregamento curto do curso único (antes do `useDelayedFlag`). */
export function StudentSingleCourseHomeOverviewSkeleton() {
  return (
    <div className="mx-auto min-w-0 max-w-[92rem] space-y-4 sm:space-y-5">
      <SingleCourseWelcomeBannerSkeleton />
      <SingleCourseInfoCardsSkeleton />
      <Skeleton className="h-6 w-[min(100%,20rem)] sm:h-7" />
      <Skeleton className="h-48 w-full rounded-2xl sm:h-56" />
    </div>
  );
}

/** Skeleton do dashboard do professor — grade de métricas + cartão de tabela. */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto min-w-0 max-w-[92rem] space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`stat-${index}`}>
            <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
              <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-8" />
              <Skeleton className="h-3.5 w-28 sm:h-4" />
              <Skeleton className="h-7 w-16 sm:h-8 md:h-9" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b p-4 sm:p-6">
          <Skeleton className="h-6 w-56 sm:h-7 sm:w-72" />
        </div>
        <div className="hidden space-y-0 md:block">
          <div className="flex border-b bg-primary/10 px-4 py-3 lg:px-6 lg:py-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="ml-8 h-4 w-20 lg:ml-12" />
            <Skeleton className="ml-auto h-4 w-14 lg:mr-16" />
            <Skeleton className="ml-8 h-4 w-20 lg:ml-12" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`row-${index}`}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-b-0 lg:px-6 lg:py-4"
            >
              <Skeleton className="h-4 w-2/5 min-w-[8rem]" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="ml-auto h-4 w-8" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`mob-${index}`} className="rounded-lg border border-border bg-muted/40 p-4">
              <Skeleton className="mb-3 h-4 w-4/5" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-28 rounded-md" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="rounded-xl border border-border">
        <div className="space-y-3 border-b p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="order-2 space-y-4 lg:order-1">
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="order-1 rounded-xl border border-border p-4 lg:order-2">
              <Skeleton className="mb-2 h-4 w-28" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
          <Skeleton className="mt-6 h-10 w-36" />
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-5 h-10 w-40" />
      </div>
    </div>
  );
}

export function CourseEditorSkeleton() {
  return (
    <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
      <div className="space-y-2 border-b pb-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border p-4">
          <Skeleton className="mb-3 h-6 w-64" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function LessonViewerSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="order-1 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card lg:order-2">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="space-y-4 p-4 sm:p-6 md:p-8">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <aside className="order-2 w-full rounded-xl border border-border bg-card p-4 lg:order-1 lg:w-80">
        <Skeleton className="mb-4 h-6 w-full" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="mb-2 h-10 w-full" />
        ))}
      </aside>
    </div>
  );
}

/** Skeleton do catálogo público — espelha `CourseCatalog` (layout distinto de aluno/professor). */
export function CourseCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="flex flex-col overflow-hidden border-border/70 bg-card shadow-sm">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
            <Skeleton className="absolute top-3 right-3 z-[2] h-5 w-16 rounded-full" />
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <CardContent className="flex flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3">
            <Skeleton className="h-3 w-16 sm:h-3.5" />
            <Skeleton className="h-4 w-4/5 sm:h-5" />
            <Skeleton className="h-3.5 w-full sm:h-4" />
            <div className="flex items-center justify-between border-t border-border/70 pt-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3.5 w-3.5" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton de “Gerenciar Cursos” — espelha `CoursesList` (capa + badge, carga/nível, botões). */
export function TeacherCoursesGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm"
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-muted">
            <Skeleton className="h-full w-full rounded-none" />
            <Skeleton className="absolute right-3 top-3 z-[2] h-5 w-20 shrink-0 rounded-full" />
          </div>
          <CardContent className="flex h-full flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4" />
                <Skeleton className="h-3 w-10 sm:h-3.5" />
              </div>
              <Skeleton className="h-3 w-20 sm:h-3.5" />
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
              <Skeleton className="h-11 w-full min-w-full flex-1 rounded-md sm:h-9 sm:min-w-[8.5rem]" />
              <Skeleton className="h-11 w-full min-w-full flex-1 rounded-md sm:h-9 sm:min-w-[8.5rem]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton de “Meus Cursos” (aluno) — espelha `Courses` (carga/nível, progresso, botão). */
export function StudentCoursesGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm"
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-muted">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <CardContent className="flex h-full flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4" />
                <Skeleton className="h-3 w-10 sm:h-3.5" />
              </div>
              <Skeleton className="h-3 w-20 sm:h-3.5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="mt-auto pt-1">
              <Skeleton className="h-11 w-full rounded-md sm:h-9" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Carregamento curto (antes do `useDelayedFlag`) — mantém feedback visual sem layout pesado. */
export function CompactContentSkeleton() {
  return (
    <div className="mx-auto min-h-[14rem] w-full max-w-[92rem] space-y-4 rounded-xl border border-border/60 bg-muted/15 p-5 sm:p-6">
      <Skeleton className="h-7 w-40 sm:h-8" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-36 w-full rounded-lg sm:h-40" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

/** Dashboard do aluno sem “curso único”: métricas + lista “Continue aprendendo”. */
export function StudentDashboardOverviewSkeleton() {
  return (
    <div className="mx-auto min-w-0 max-w-[92rem] space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-l-4 border-l-transparent">
            <CardContent className="flex items-center gap-4 p-4 sm:p-6">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-16 sm:h-9" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 sm:h-8" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-4/5 sm:h-6" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Apenas a linha de métricas do dashboard do professor (carregamento rápido). */
export function TeacherDashboardStatsSkeleton() {
  return (
    <div className="mx-auto min-w-0 max-w-[92rem] space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
              <Skeleton className="h-7 w-7 rounded-md sm:h-8 sm:w-8" />
              <Skeleton className="h-3.5 w-28 sm:h-4" />
              <Skeleton className="h-7 w-16 sm:h-8 md:h-9" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b p-4 sm:p-6">
          <Skeleton className="h-6 w-56 sm:h-7 sm:w-72" />
        </div>
        <div className="hidden space-y-0 md:block">
          <div className="flex border-b bg-primary/10 px-4 py-3 lg:px-6 lg:py-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="ml-8 h-4 w-20 lg:ml-12" />
            <Skeleton className="ml-auto h-4 w-14 lg:mr-16" />
            <Skeleton className="ml-8 h-4 w-20 lg:ml-12" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`row-${index}`}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-b-0 lg:px-6 lg:py-4"
            >
              <Skeleton className="h-4 w-2/5 min-w-[8rem]" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="ml-auto h-4 w-8" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={`mob-${index}`} className="rounded-lg border border-border bg-muted/40 p-4">
              <Skeleton className="mb-3 h-4 w-4/5" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-28 rounded-md" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** Lista de cartões (gestão de usuários) — usar abaixo do cabeçalho e filtros reais. */
export function UserManagementCardsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72 max-w-full" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Gestão de usuários — layout completo (catálogo standalone / story). */
export function UserManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 sm:h-9" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
      <UserManagementCardsSkeleton />
    </div>
  );
}

/** Página pública de detalhe do curso — hero + cartão lateral (carregamento inicial). */
export function CourseDetailPageSkeleton() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-50 pb-12 sm:pb-20">
      <div className="bg-sidebar py-12 text-white sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-8 w-20 bg-white/20" />
            <Skeleton className="h-12 w-4/5 bg-white/25" />
            <Skeleton className="h-6 w-3/5 bg-white/20" />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-5 w-32 bg-white/15" />
              <Skeleton className="h-5 w-28 bg-white/15" />
            </div>
          </div>
          <div className="rounded-xl bg-white p-5 sm:p-6">
            <Skeleton className="mb-6 h-8 w-full bg-slate-200" />
            <Skeleton className="mb-4 h-12 w-full bg-slate-200" />
            <Skeleton className="h-3 w-full bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48 bg-slate-200" />
        <Skeleton className="h-24 w-full rounded-lg bg-slate-100 sm:h-32" />
      </div>
    </div>
  );
}
