import { api } from '@/lib/axios';

const VIDEO_EXT_TO_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
};

export function resolveLessonVideoMimeType(file: File): string {
  const fromType = (file.type || '').split(';')[0]?.trim().toLowerCase();
  if (fromType && Object.values(VIDEO_EXT_TO_MIME).includes(fromType)) {
    return fromType;
  }
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  const fromExt = ext ? VIDEO_EXT_TO_MIME[ext] : undefined;
  if (fromExt) return fromExt;
  throw new Error('Formato de vídeo não suportado. Use MP4, WebM ou MOV.');
}

type UploadLessonVideoParams = {
  lessonId: string;
  file: File;
  onProgress?: (percent: number) => void;
};

type UploadLessonVideoResult = {
  objectKey: string;
  contentType: string;
};

/**
 * Upload de vídeo via URL pré-assinada (PUT direto no bucket S3/R2).
 * Evita passar o arquivo pelo backend — necessário no Render free (limite de /tmp).
 * Fallback multipart via API só com VITE_VIDEO_API_UPLOAD=true.
 */
export async function uploadLessonVideo({
  lessonId,
  file,
  onProgress,
}: UploadLessonVideoParams): Promise<UploadLessonVideoResult> {
  const contentType = resolveLessonVideoMimeType(file);

  if (import.meta.env.VITE_VIDEO_API_UPLOAD === 'true') {
    return uploadLessonVideoViaApi({ lessonId, file, contentType, onProgress });
  }

  return uploadLessonVideoViaPresignedUrl({ lessonId, file, contentType, onProgress });
}

async function uploadLessonVideoViaPresignedUrl({
  lessonId,
  file,
  contentType,
  onProgress,
}: UploadLessonVideoParams & { contentType: string }): Promise<UploadLessonVideoResult> {
  const presignRes = await api.post<{
    uploadUrl: string;
    objectKey: string;
    headers: { 'Content-Type': string };
  }>('/teacher/videos/presign-upload', {
    lessonId,
    fileName: file.name,
    contentType,
    fileSizeBytes: file.size,
  });

  const { uploadUrl, objectKey, headers } = presignRes.data;
  const signedContentType = headers['Content-Type'] || contentType;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', signedContentType);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100))));
    };
    xhr.onerror = () =>
      reject(
        new Error(
          'Falha de rede durante o upload. Verifique o CORS do bucket R2/S3 (PUT + Content-Type) para a origem do frontend.',
        ),
      );
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      if (xhr.status === 403) {
        reject(new Error('Upload recusado pelo storage (403). Verifique credenciais e política CORS do bucket.'));
        return;
      }
      reject(new Error(`Upload falhou (${xhr.status})`));
    };
    xhr.send(file);
  });

  return { objectKey, contentType: signedContentType };
}

/** Fallback: envia o vídeo pela API (multipart). Usa /tmp no servidor — evitar em produção no Render free. */
async function uploadLessonVideoViaApi({
  lessonId,
  file,
  contentType,
  onProgress,
}: UploadLessonVideoParams & { contentType: string }): Promise<UploadLessonVideoResult> {
  const form = new FormData();
  form.append('lessonId', lessonId);
  form.append('file', file, file.name);

  const uploadUrl = resolveVideoUploadUrl();

  const res = await api.post<{ objectKey: string; contentType?: string }>(uploadUrl, form, {
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    transformRequest: [
      (data, headers) => {
        if (headers && typeof headers === 'object') {
          delete (headers as Record<string, unknown>)['Content-Type'];
        }
        return data;
      },
    ],
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100))));
    },
  });

  return {
    objectKey: res.data.objectKey,
    contentType: res.data.contentType || contentType,
  };
}

function resolveVideoUploadUrl(): string {
  const fromEnv = import.meta.env.VITE_API_ORIGIN?.trim().replace(/\/$/, '');
  if (fromEnv) {
    return `${fromEnv}/api/teacher/videos/upload`;
  }
  return '/api/teacher/videos/upload';
}
