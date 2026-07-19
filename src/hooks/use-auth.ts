import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import {
  clearAuthTokenCookie,
  hasAuthTokenCookie,
  setAuthTokenCookie,
} from "@/lib/auth-cookie";
import { StudentDashboard, UserProfile } from "@/types/api";
import { isStaffRole } from "@/lib/permissions";

// FUNÇÃO PARA GERENCIAR AUTENTICAÇÃO E SESSÃO NO FRONTEND
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasToken = hasAuthTokenCookie();
  // FUNÇÃO PARA CONSULTAR O PERFIL DO USUÁRIO AUTENTICADO
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await api.get<UserProfile>("/auth/me");
        return res.data as UserProfile;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    enabled: hasToken,
    initialData: hasToken
      ? () => queryClient.getQueryData<UserProfile | null>(["auth", "me"]) ?? undefined
      : null,
    placeholderData: (previousData) => previousData,
  });

  // FUNÇÃO PARA FAZER LOGIN
  const login = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await api.post("/auth/login", credentials);
      return res.data;
    },
    onSuccess: (data) => {
      if (!data?.token || !data?.user) return;
      setAuthTokenCookie(data.token);
      queryClient.setQueryData(["auth", "me"], data.user);

      if (!isStaffRole(data.user.role)) {
        // Inicia o prefetch do dashboard do aluno imediatamente após o login,
        // enquanto o React Router ainda está processando a navegação.
        // Quando o componente Dashboard montar, o dado já estará em cache.
        void queryClient.prefetchQuery({
          queryKey: ["student-dashboard"],
          queryFn: async () => {
            const res = await api.get<StudentDashboard>("/student/dashboard", {
              headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
            });
            return res.data;
          },
          staleTime: 5 * 60_000,
        });
      }

      navigate(isStaffRole(data.user.role) ? "/teacher/dashboard" : "/student/dashboard", {
        replace: true,
      });
    },
  });

  // FUNÇÃO PARA REGISTRAR UM NOVO USUÁRIO (retorna apenas mensagem; sem login automático)
  const register = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/auth/register", data);
      return res.data as { message: string };
    },
  });

  // FUNÇÃO PARA ENCERRAR A SESSÃO LOCAL DO USUÁRIO
  const logout = () => {
    clearAuthTokenCookie();
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
