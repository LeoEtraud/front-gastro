import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UseChatHelpers, UIMessage } from "@ai-sdk/react";
import { useAuth } from "@/hooks/use-auth";
import { getAuthTokenFromCookie } from "@/lib/auth-cookie";

const CHAT_ID = "gastrocentro-assistant";

// Tipo do contexto de chat do assistente GastroCentro
type MedlearnAiChatContextValue = UseChatHelpers<UIMessage>;

// Contexto de chat do assistente GastroCentro
const MedlearnAiChatContext = createContext<MedlearnAiChatContextValue | null>(
  null,
);

// Props do provider de contexto de chat
type MedlearnAiChatProviderProps = {
  children: ReactNode;
  apiEndpoint?: string;
};

// Provider de contexto de chat (assistente GastroCentro)
export function MedlearnAiChatProvider({
  children,
  apiEndpoint = "/api/chat",
}: MedlearnAiChatProviderProps) {
  const { user } = useAuth();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiEndpoint,
        headers: () => {
          const token = getAuthTokenFromCookie();
          if (!token) {
            return new Headers();
          }
          return new Headers({ Authorization: `Bearer ${token}` });
        },
      }),
    [apiEndpoint],
  );

  const chat = useChat({
    id: CHAT_ID,
    transport,
  });

  const { setMessages } = chat;

  const prevHadUser = useRef(false);  

  // FUNÇÃO PARA LIMPAR AS MENSAGENS DO CHAT QUANDO O USUÁRIO MUDA
  useEffect(() => {
    if (user) {
      prevHadUser.current = true;
      return;
    }
    if (prevHadUser.current) {
      setMessages([]);
      prevHadUser.current = false;
    }
  }, [user, setMessages]);

  return (
    <MedlearnAiChatContext.Provider value={chat}>
      {children}
    </MedlearnAiChatContext.Provider>
  );
}

// Hook do contexto de chat do assistente GastroCentro
export function useMedlearnAiChat() {
  const ctx = useContext(MedlearnAiChatContext);
  if (!ctx) {
    throw new Error(
      "useMedlearnAiChat deve ser usado dentro de MedlearnAiChatProvider (GastroCentro)",
    );
  }
  return ctx;
}
