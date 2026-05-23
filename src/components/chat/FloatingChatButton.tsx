import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import { useMedlearnAiChat } from "@/contexts/medlearn-ai-chat-context";

type FloatingChatButtonProps = {
  title?: string;
};

type ChatMessagePart = {
  type: string;
  text?: string;
};

type ChatMessage = {
  id: string;
  role: string;
  parts: ChatMessagePart[];
};

export function FloatingChatButton({
  title = "Assistente GastroCentro",
}: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status, error } = useMedlearnAiChat();

  const isLoading = status === "submitted" || status === "streaming";
  const typedMessages = messages as ChatMessage[];

  const hasMessages = typedMessages.length > 0;

  const canSubmit = useMemo(() => {
    return input.trim().length > 0 && status === "ready";
  }, [input, status]);

  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading, isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();

    if (!message || status !== "ready") {
      return;
    }

    sendMessage({ text: message });
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-3 flex h-[70vh] w-[calc(100vw-2rem)] max-h-[620px] max-w-sm flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <header className="flex items-center justify-between border-b border-slate-600 bg-slate-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/15 p-2 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{title}</p>
                <p className="text-xs text-white/80">
                  Tire suas dúvidas em tempo real
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Fechar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
          >
            {!hasMessages ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                Pergunte algo sobre seu estudo. Estou aqui para ajudar.
              </div>
            ) : (
              typedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1 text-[11px] opacity-80">
                      {message.role === "user" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span>
                        {message.role === "user" ? "Você" : "Assistente"}
                      </span>
                    </div>
                    {message.parts.map((part: ChatMessagePart, index: number) =>
                      part.type === "text" ? (
                        <p
                          key={`${message.id}-${index}`}
                          className="whitespace-pre-wrap break-words leading-relaxed"
                        >
                          {part.text}
                        </p>
                      ) : null,
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Assistente digitando...
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-border/70 p-3 sm:p-4">
            {error && (
              <p className="mb-2 rounded-lg bg-destructive/10 px-2 py-1 text-xs text-destructive">
                Erro ao responder. Tente novamente.
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={status !== "ready"}
                className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </footer>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gc-coral text-white shadow-[0_8px_24px_-6px_rgba(255,107,53,0.45)] transition hover:scale-[1.03] hover:bg-[#e85f2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gc-coral focus-visible:ring-offset-2"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
