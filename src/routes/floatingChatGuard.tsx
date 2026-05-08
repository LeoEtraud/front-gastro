import { useLocation } from "react-router-dom";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { useAuth } from "@/hooks/use-auth";

export function AuthenticatedFloatingChat() {
  const { user } = useAuth();
  const location = useLocation();

  // O assistente só deve aparecer nas áreas privadas (aluno/professor).
  // Nunca renderizar na Home pública e nas páginas públicas de cursos.
  const isPrivateArea =
    location.pathname.startsWith("/student") || location.pathname.startsWith("/teacher");

  if (!user || !isPrivateArea) return null;

  return <FloatingChatButton />;
}
