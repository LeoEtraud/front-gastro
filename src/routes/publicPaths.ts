const PUBLIC_PATHS = new Set([
  "/", // Home page é pública e nunca deve exibir o assistente.
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/courses", // Catálogo de cursos é público.
]);

export function isPublicAuthPath(pathname: string): boolean {
  const rawPath = pathname.split("?")[0] ?? pathname;
  const path = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;

  if (PUBLIC_PATHS.has(path)) return true;
  // Detalhe de curso também é público: /courses/:id
  if (path.startsWith("/courses/")) return true;

  return false;
}
