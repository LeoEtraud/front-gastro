export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMaterialExtension(ext: string): string {
  return ext.toUpperCase();
}

export function isPdfExtension(ext: string): boolean {
  return ext.toLowerCase() === 'pdf';
}

export function isPowerPointExtension(ext: string): boolean {
  const normalized = ext.toLowerCase();
  return normalized === 'ppt' || normalized === 'pptx';
}

export const LESSON_MATERIAL_ACCEPT = '.pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
