import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MedlearnAiChatProvider } from "@/contexts/medlearn-ai-chat-context";
import { AppRoutes, AuthenticatedFloatingChat } from "@/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // 5 min de "freshness" global: evita refetch desnecessário ao voltar para
      // uma página já visitada na mesma sessão.
      staleTime: 5 * 60_000,
      // 30 min no garbage collector: dados ficam em cache entre navegações.
      gcTime: 30 * 60_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300} skipDelayDuration={200}>
        <MedlearnAiChatProvider apiEndpoint="/api/chat">
          <AppRoutes />
          <AuthenticatedFloatingChat />
        </MedlearnAiChatProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
