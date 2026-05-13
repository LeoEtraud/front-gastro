import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, ImagePlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateCourse,
  useCreateLesson,
  useCreateModule,
  useUpdateModule,
} from "@/hooks/use-teacher";
import type { CourseLevel, LessonType } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDICAL_SPECIALTIES } from "@/lib/medical-specialties";
import { uploadCourseCoverFile } from "@/lib/course-cover-upload";

function parseRequestError(error: unknown, fallback: string) {
  const ax = error as { response?: { data?: { error?: string } }; message?: string };
  return ax?.response?.data?.error || ax?.message || fallback;
}

type ModalShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  submitLabel: string;
};

function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  children,
  isSubmitting = false,
  errorMessage,
  submitLabel,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * `overflow-hidden` no DialogContent garante que o border-radius nunca
       * seja interceptado pela scrollbar. O scroll real fica apenas no corpo
       * (form > div), enquanto header e footer permanecem fixos.
       *
       * `hideCloseButton` desativa o "X" padrão (posicionado pelo `top-4` do
       * DialogContent) para podermos renderizar nosso próprio close button
       * alinhado verticalmente ao bloco título + subtítulo.
       */}
      <DialogContent
        hideCloseButton
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden bg-card p-0 sm:max-w-[760px]"
      >
        <DialogHeader className="shrink-0 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div className="relative space-y-1.5 pr-10 sm:pr-12">
            <DialogTitle className="text-xl sm:text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
            <DialogClose
              aria-label="Fechar"
              className="absolute right-0 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </div>
          <Separator className="mt-3" />
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
            {errorMessage ? (
              <Alert variant="destructive" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {children}
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-card px-6 py-4 sm:px-8">
            <Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const courseSchema = z.object({
  title: z.string().trim().min(3, "Título é obrigatório"),
  subtitle: z.string().trim().optional(),
  shortDescription: z.string().trim().min(12, "Descrição curta é obrigatória"),
  description: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  specialty: z.string().trim().min(1, "Especialidade é obrigatória"),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  workloadHours: z
    .union([z.literal(""), z.coerce.number().int().min(1, "Carga horária deve ser maior que 0")])
    .optional(),
  tags: z.string().trim().optional(),
});

type CreateCourseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CourseFormValues = z.infer<typeof courseSchema>;

export function CreateCourseModal({ open, onOpenChange }: CreateCourseModalProps) {
  const createCourse = useCreateCourse();
  const { toast } = useToast();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      shortDescription: "",
      description: "",
      coverImageUrl: "",
      specialty: "",
      level: "BASIC",
      workloadHours: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (!open) {
      setRequestError(null);
      setCoverPreview(null);
      setCoverUploadError(null);
      form.reset();
    }
  }, [open, form]);

  const handleCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setCoverUploadError(null);
      const dataUrl = await uploadCourseCoverFile(file);
      setCoverPreview(dataUrl);
      form.setValue("coverImageUrl", dataUrl, { shouldDirty: true, shouldValidate: true });
    } catch (error: unknown) {
      setCoverUploadError(parseRequestError(error, "Falha ao carregar imagem."));
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    setCoverUploadError(null);
    form.setValue("coverImageUrl", "", { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setRequestError(null);
    try {
      await createCourse.mutateAsync({
        title: values.title,
        subtitle: values.subtitle || undefined,
        shortDescription: values.shortDescription || undefined,
        description: values.description || undefined,
        coverImageUrl: values.coverImageUrl || undefined,
        specialty: values.specialty || undefined,
        level: values.level,
        workloadHours: values.workloadHours === "" ? undefined : values.workloadHours,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      });
      toast({ variant: "success", title: "Curso criado com sucesso" });
      onOpenChange(false);
    } catch (error) {
      setRequestError(parseRequestError(error, "Erro inesperado ao criar curso"));
    }
  });

  return (
    // MODAL PARA CRIAR UM CURSO
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Novo Curso"
      description="Preencha os dados principais para criar um novo curso."
      onSubmit={onSubmit}
      isSubmitting={createCourse.isPending}
      errorMessage={requestError}
      submitLabel="Criar curso"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Título *</label>
          <Input className="bg-background" {...form.register("title")} placeholder="Ex.: Fisiologia Cardiovascular" />
          {form.formState.errors.title ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nível</label>
          <Select
            value={form.watch("level")}
            onValueChange={(value) => form.setValue("level", value as CourseLevel, { shouldValidate: true })}
          >
            <SelectTrigger className="bg-background">
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
          <Input
            type="number"
            min={1}
            placeholder="Ex.: 40"
            className="bg-background"
            {...form.register("workloadHours")}
          />
          {form.formState.errors.workloadHours ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.workloadHours.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Subtítulo</label>
          <Input className="bg-background" {...form.register("subtitle")} placeholder="Resumo curto do curso" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Especialidade *</label>
          <Select
            value={form.watch("specialty") || undefined}
            onValueChange={(value) => form.setValue("specialty", value, { shouldValidate: true })}
          >
            <SelectTrigger className="bg-background">
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

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Descrição curta *</label>
          <Textarea
            rows={2}
            className="bg-background"
            {...form.register("shortDescription")}
            placeholder="Descrição breve para listagens"
          />
          {form.formState.errors.shortDescription ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.shortDescription.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Descrição completa</label>
          <Textarea
            rows={4}
            className="bg-background"
            {...form.register("description")}
            placeholder="Detalhes completos do curso"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Capa do curso (opcional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleCoverChange}
          />
          <div className="space-y-2 rounded-lg border border-border/70 bg-background p-2.5">
            {coverPreview ? (
              <div className="overflow-hidden rounded-md border border-border/70 bg-muted">
                <img src={coverPreview} alt="Pré-visualização da capa" className="h-36 w-full object-cover" />
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
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                {coverPreview ? "Trocar imagem da capa" : "Selecionar imagem da capa"}
              </Button>
              {coverPreview ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleRemoveCover}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              ) : null}
            </div>
          </div>
          {coverUploadError ? <p className="text-xs font-medium text-destructive">{coverUploadError}</p> : null}
          <p className="text-xs text-muted-foreground">Formatos aceitos: JPEG, PNG, WebP ou GIF (até 3 MB).</p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Tags</label>
          <Input className="bg-background" {...form.register("tags")} placeholder="cardio, ecg, emergência" />
          <p className="text-xs text-muted-foreground">Separe por vírgula.</p>
        </div>
      </div>
    </ModalShell>
  );
}

// SCHEMA PARA CRIAR UM MÓDULO
const moduleSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().optional(),
  order: z
    .union([z.literal(""), z.coerce.number().int().min(0, "Ordem não pode ser negativa")])
    .optional(),
});

// PROPS PARA CRIAR UM MÓDULO
type CreateModuleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  defaultOrder?: number;
};

// FORM VALUES PARA CRIAR UM MÓDULO
type ModuleFormValues = z.infer<typeof moduleSchema>;

// COMPONENTE PARA CRIAR UM MÓDULO
export function CreateModuleModal({ open, onOpenChange, courseId, defaultOrder }: CreateModuleModalProps) {
  const createModule = useCreateModule();
  const { toast } = useToast();
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: "", description: "", order: defaultOrder ?? "" },
  });

  useEffect(() => {
    if (!open) {
      setRequestError(null);
      form.reset({ title: "", description: "", order: defaultOrder ?? "" });
    }
  }, [open, defaultOrder, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setRequestError(null);
    try {
      await createModule.mutateAsync({
        courseId,
        title: values.title,
        description: values.description || undefined,
        order: values.order === "" ? undefined : values.order,
      });
      toast({ variant: "success", title: "Módulo criado com sucesso" });
      onOpenChange(false);
    } catch (error) {
      setRequestError(parseRequestError(error, "Erro inesperado ao criar módulo"));
    }
  });

  return (
    // MODAL PARA CRIAR UM MÓDULO
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Novo Módulo"
      description="Crie um módulo vinculado ao curso atual."
      onSubmit={onSubmit}
      isSubmitting={createModule.isPending}
      errorMessage={requestError}
      submitLabel="Criar módulo"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Título *</label>
          <Input className="bg-background" {...form.register("title")} placeholder="Ex.: Fundamentos de ECG" />
          {form.formState.errors.title ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            rows={3}
            className="bg-background"
            {...form.register("description")}
            placeholder="Resumo do conteúdo do módulo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ordem</label>
          <Input type="number" min={0} className="bg-background" {...form.register("order")} />
          {form.formState.errors.order ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.order.message}</p>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}

// SCHEMA PARA EDITAR UM MÓDULO
const editModuleSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().optional(),
});

// PROPS PARA EDITAR UM MÓDULO
type EditModuleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: { id: string; title: string; description?: string | null } | null;
  courseId: string;
};

// FORM VALUES PARA EDITAR UM MÓDULO
type EditModuleFormValues = z.infer<typeof editModuleSchema>;

// COMPONENTE PARA EDITAR UM MÓDULO
export function EditModuleModal({ open, onOpenChange, module, courseId }: EditModuleModalProps) {
  const updateModule = useUpdateModule();
  const { toast } = useToast();
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<EditModuleFormValues>({
    resolver: zodResolver(editModuleSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (open && module) {
      setRequestError(null);
      form.reset({
        title: module.title ?? "",
        description: module.description ?? "",
      });
    }
    if (!open) {
      setRequestError(null);
    }
  }, [open, module, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!module) return;
    setRequestError(null);
    try {
      await updateModule.mutateAsync({
        id: module.id,
        courseId,
        data: {
          title: values.title,
          description: values.description ? values.description : null,
        },
      });
      toast({ variant: "success", title: "Módulo atualizado com sucesso" });
      onOpenChange(false);
    } catch (error) {
      setRequestError(parseRequestError(error, "Erro inesperado ao atualizar módulo"));
    }
  });

  return (
    // MODAL PARA EDITAR UM MÓDULO
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Módulo"
      description="Atualize o título e a descrição do módulo."
      onSubmit={onSubmit}
      isSubmitting={updateModule.isPending}
      errorMessage={requestError}
      submitLabel="Salvar alterações"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Título *</label>
          <Input className="bg-background" {...form.register("title")} placeholder="Ex.: Fundamentos de ECG" />
          {form.formState.errors.title ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            rows={3}
            className="bg-background"
            {...form.register("description")}
            placeholder="Resumo do conteúdo do módulo"
          />
        </div>
      </div>
    </ModalShell>
  );
}

const lessonSchema = z.object({
  moduleId: z.string().trim().min(1, "Selecione um módulo"),
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().optional(),
  type: z.enum(["VIDEO", "TEXT", "PDF", "QUIZ", "MIXED"]),
  order: z
    .union([z.literal(""), z.coerce.number().int().min(0, "Ordem não pode ser negativa")])
    .optional(),
  duration: z
    .union([z.literal(""), z.coerce.number().int().min(1, "Duração deve ser maior que 0")])
    .optional(),
  isPublished: z.boolean(),
});

type ModuleOption = {
  id: string;
  title: string;
};

type CreateLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleOptions: ModuleOption[];
  defaultModuleId?: string;
  defaultOrder?: number;
};

type LessonFormValues = z.infer<typeof lessonSchema>;

export function CreateLessonModal({
  open,
  onOpenChange,
  moduleOptions,
  defaultModuleId,
  defaultOrder,
}: CreateLessonModalProps) {
  const createLesson = useCreateLesson();
  const { toast } = useToast();
  const [requestError, setRequestError] = useState<string | null>(null);

  const firstModuleId = useMemo(() => defaultModuleId || moduleOptions[0]?.id || "", [defaultModuleId, moduleOptions]);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      moduleId: firstModuleId,
      title: "",
      description: "",
      type: "VIDEO",
      order: defaultOrder ?? "",
      duration: "",
      isPublished: true,
    },
  });

  useEffect(() => {
    if (!open) {
      setRequestError(null);
      form.reset({
        moduleId: firstModuleId,
        title: "",
        description: "",
        type: "VIDEO",
        order: defaultOrder ?? "",
        duration: "",
        isPublished: true,
      });
    }
  }, [open, defaultOrder, firstModuleId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setRequestError(null);
    try {
      await createLesson.mutateAsync({
        moduleId: values.moduleId,
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        order: values.order === "" ? undefined : values.order,
        duration: values.duration === "" ? undefined : values.duration,
        isPublished: values.isPublished,
      });
      toast({ variant: "success", title: "Aula criada com sucesso" });
      onOpenChange(false);
    } catch (error) {
      setRequestError(parseRequestError(error, "Erro inesperado ao criar aula"));
    }
  });

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Nova Aula"
      description="Crie uma aula vinculada a um módulo do curso."
      onSubmit={onSubmit}
      isSubmitting={createLesson.isPending}
      errorMessage={requestError}
      submitLabel="Criar aula"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Módulo *</label>
          <Select
            value={form.watch("moduleId")}
            onValueChange={(value) => form.setValue("moduleId", value, { shouldValidate: true })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione um módulo" />
            </SelectTrigger>
            <SelectContent>
              {moduleOptions.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.moduleId ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.moduleId.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Título *</label>
          <Input className="bg-background" {...form.register("title")} placeholder="Ex.: Anatomia do Coração" />
          {form.formState.errors.title ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea rows={3} className="bg-background" {...form.register("description")} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <Select
            value={form.watch("type")}
            onValueChange={(value) => form.setValue("type", value as LessonType, { shouldValidate: true })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIDEO">Vídeo</SelectItem>
              <SelectItem value="TEXT">Texto</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="MIXED">Misto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ordem</label>
          <Input type="number" min={0} className="bg-background" {...form.register("order")} />
          {form.formState.errors.order ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.order.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duração (minutos)</label>
          <Input type="number" min={1} className="bg-background" {...form.register("duration")} />
          {form.formState.errors.duration ? (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.duration.message}</p>
          ) : null}
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={form.watch("isPublished")}
            onCheckedChange={(checked) => form.setValue("isPublished", checked === true)}
          />
          Publicar aula imediatamente
        </label>
      </div>
    </ModalShell>
  );
}
