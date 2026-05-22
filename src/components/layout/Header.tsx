import { ChevronDown, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/types/api";
import { displayFirstLastName } from "@/lib/display-name";
import { isStaffRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: UserProfile;
  theme: "light" | "dark";
  onMenuToggle: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

function roleLabel(role: UserProfile["role"]) {
  if (role === "ADMIN") return "Administrador";
  if (role === "TEACHER") return "Professor";
  return "Estudante";
}

export function Header({ user, theme, onMenuToggle, onToggleTheme, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const shortName = displayFirstLastName(user.name);
  const firstLetter = shortName?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || "U";
  const profileHref = isStaffRole(user.role) ? "/teacher/profile" : "/student/profile";
  const rLabel = roleLabel(user.role);

  return (
    <header
      className={cn(
        "h-12 shrink-0 rounded-2xl border border-border bg-card text-card-foreground shadow-md sm:h-16",
      )}
    >
      <div className="flex h-full items-center justify-between gap-3 pl-1 pr-4 sm:pl-1.5 sm:pr-6">
        <div className="flex h-full min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          <div className="flex h-full shrink-0 items-center py-1 sm:py-1.5">
            <img
              src="/header-fellowship.jpg"
              alt="Fellowship Endoscopia Digestiva Alta"
              className="h-full w-auto object-contain object-left"
            />
          </div>

          <button
            type="button"
            onClick={onMenuToggle}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
            title={theme === "light" ? "Tema escuro" : "Tema claro"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <span
            aria-hidden
            role="presentation"
            className="mx-1 h-7 w-0.5 shrink-0 self-center rounded-full bg-border sm:mx-1.5 sm:h-9"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex min-w-0 items-center gap-2 rounded-xl p-1.5 text-left transition-colors",
                  "hover:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
                aria-label="Abrir menu do usuário"
                aria-haspopup="menu"
              >
                <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <Avatar className="h-9 w-9 shrink-0 border-2 border-border sm:h-10 sm:w-10">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" className="object-cover" />
                    <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{firstLetter}</AvatarFallback>
                  </Avatar>
                  <span className="hidden min-w-0 max-w-[140px] flex-col sm:flex sm:max-w-[180px]">
                    <span className="truncate text-sm font-semibold uppercase leading-tight tracking-wide">
                      {shortName || user.name}
                    </span>
                    <span className="truncate text-xs leading-tight tracking-wide text-muted-foreground uppercase">
                      {rLabel}
                    </span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-[100] min-w-[208px] rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-xl shadow-black/10 ring-1 ring-black/5 dark:border-border dark:shadow-black/40 dark:ring-white/10"
            >
              <DropdownMenuItem
                className="h-10 cursor-pointer rounded-lg px-3 text-popover-foreground focus:bg-primary/10 focus:text-foreground data-[highlighted]:bg-primary/10"
                onSelect={() => navigate(profileHref)}
              >
                <User className="mr-2 h-4 w-4 shrink-0 text-primary" />
                Perfil do usuário
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-border/80" />
              <DropdownMenuItem
                className="h-10 cursor-pointer rounded-lg px-3 text-destructive focus:bg-destructive/15 focus:text-destructive data-[highlighted]:bg-destructive/15 data-[highlighted]:text-destructive"
                onSelect={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
