import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton do dashboard do aluno — layout atual (stats/continue + experiência de curso único). */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[92rem] min-w-0 space-y-4 sm:space-y-5">
      {/* Corpo docente */}
      <div className="space-y-2 sm:space-y-2.5">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-full max-w-[28rem]" />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`faculty-${index}`} className="border-border/80">
              <CardContent className="space-y-2 p-3 sm:p-3.5">
                <div className="flex items-start gap-2.5">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full sm:h-11 sm:w-11" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Aulas em destaque + mural */}
      <div className="space-y-2 sm:space-y-2.5">
        <Skeleton className="h-6 w-64" />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`top-lessons-${index}`} className="overflow-hidden border-border/80">
              <Skeleton className="aspect-[16/8.7] w-full rounded-none" />
              <CardContent className="p-2 sm:p-2.5">
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3">
          <Card className="overflow-hidden border-border/80 md:col-span-1">
            <Skeleton className="aspect-[16/8.7] w-full rounded-none" />
            <CardContent className="p-2 sm:p-2.5">
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>

          <Card className="border-border/80 md:col-span-2">
            <CardContent className="space-y-2 p-3 sm:p-3.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-10 w-full" />

              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={`mural-item-${idx}`} className="h-7 w-full" />
                ))}
              </div>

              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <div className="grid gap-1 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={`mural-module-${idx}`} className="h-6 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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

export function CourseCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeacherCoursesGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex h-full flex-col gap-3 p-3 sm:gap-3.5 sm:p-4 xl:gap-3 xl:p-3 2xl:gap-3.5 2xl:p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-3 w-28 sm:h-3.5" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5 sm:h-6 xl:h-5 2xl:h-6" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full sm:h-3.5" />
              <Skeleton className="h-3 w-3/5 sm:h-3.5" />
            </div>

            <div className="flex items-center justify-between border-t border-border/80 pt-2.5 sm:pt-3">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4" />
                <Skeleton className="h-3 w-10 sm:h-3.5" />
              </div>
              <Skeleton className="h-3 w-20 sm:h-3.5" />
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
              <Skeleton className="h-8 w-full flex-1 min-w-full sm:min-w-[8.5rem] sm:h-9" />
              <Skeleton className="h-8 w-full flex-1 min-w-full sm:min-w-[8.5rem] sm:h-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton da grade “Meus cursos” (aluno), alinhado ao layout de Gerenciar Cursos + barra de progresso. */
export function StudentCoursesGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex h-full flex-col gap-3 p-3 sm:gap-3.5 sm:p-4 xl:gap-3 xl:p-3 2xl:gap-3.5 2xl:p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-3 w-28 sm:h-3.5" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5 sm:h-6 xl:h-5 2xl:h-6" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full sm:h-3.5" />
              <Skeleton className="h-3 w-3/5 sm:h-3.5" />
            </div>

            <div className="flex items-center justify-between border-t border-border/80 pt-2.5 sm:pt-3">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4" />
                <Skeleton className="h-3 w-10 sm:h-3.5" />
              </div>
              <Skeleton className="h-3 w-20 sm:h-3.5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="mt-auto pt-1">
              <Skeleton className="h-9 w-full rounded-md sm:h-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
