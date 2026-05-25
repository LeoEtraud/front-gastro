import { type LucideIcon, FileText, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLegalDocuments } from "@/hooks/use-legal-documents";
import { APP_VERSION } from "@/lib/app-version";
import { cn } from "@/lib/utils";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  links: NavigationItem[];
  location: string;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItemClass = (isActive: boolean, collapsed: boolean, mobile: boolean) =>
  cn(
    "gc-sidebar-item flex cursor-pointer items-center",
    collapsed && !mobile ? "justify-center px-0 py-3" : "mx-1.5 gap-3 px-4 py-2.5",
    isActive
      ? "gc-sidebar-item--active font-semibold text-sidebar-active-foreground"
      : "font-medium text-sidebar-foreground",
  );

const iconButtonClass =
  "shrink-0 rounded-xl p-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground";

export function Sidebar({
  links,
  location,
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const { openTerms, openPrivacy, modals } = useLegalDocuments();

  const footer = (mobile: boolean) => (
    <div
      className={cn(
        "mt-auto gc-sidebar-footer border-t border-sidebar-border pt-5",
        collapsed && !mobile ? "px-2" : "px-3",
      )}
    >
      {!collapsed || mobile ? (
        <div className="space-y-2.5">
          <div className="flex flex-col gap-1.5 text-center text-xs font-medium text-sidebar-foreground/75">
            <button
              type="button"
              onClick={openTerms}
              className="transition-colors hover:text-sidebar-foreground"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={openPrivacy}
              className="transition-colors hover:text-sidebar-foreground"
            >
              Política de Privacidade
            </button>
          </div>
          <p className="gc-version text-center text-xs font-medium text-sidebar-muted">Versão {APP_VERSION}</p>
        </div>
      ) : (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(iconButtonClass, "flex w-full justify-center")}
                  aria-label="Termos de uso e privacidade"
                >
                  <FileText className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Termos e privacidade</TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="right" align="end" className="min-w-[12rem]">
            <DropdownMenuItem onSelect={openTerms}>Termos de Uso</DropdownMenuItem>
            <DropdownMenuItem onSelect={openPrivacy}>Política de Privacidade</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const renderNav = (mobile = false) => (
    <nav className={cn("flex flex-1 flex-col overflow-y-auto py-5", collapsed && !mobile ? "px-2.5" : "px-3.5")}>
      <ul className="flex-1 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(`${item.href}/`);

          const linkContent = (
            <Link to={item.href} onClick={mobile ? onClose : undefined}>
              <span className={navItemClass(isActive, collapsed, mobile)}>
                <Icon className="h-5 w-5 shrink-0" />
                {(!collapsed || mobile) && <span>{item.label}</span>}
              </span>
            </Link>
          );

          return (
            <li key={item.href}>
              {collapsed && !mobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )}
            </li>
          );
        })}
      </ul>
      {footer(mobile)}
    </nav>
  );

  const shellClass = cn(
    "gc-sidebar-shell flex h-full flex-col rounded-[22px] border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-all duration-300",
  );

  const clinicLogo = (compact = false) => (
    <img
      src={compact ? "/logo-menu-recolhido.png" : "/logo-menu.png"}
      alt="GastroCentro"
      className={cn(
        compact
          ? "h-5 w-5 shrink-0 bg-transparent object-contain"
          : "block h-[4.25rem] w-full max-w-[15rem] bg-transparent object-contain object-left min-w-0",
      )}
    />
  );

  const desktopSidebar = (
    <aside className={cn(shellClass, collapsed ? "w-[4.5rem]" : "w-64")}>
      <div
        className={cn(
          "shrink-0 gc-sidebar-header rounded-t-[22px] border-b border-sidebar-border bg-sidebar-header",
          collapsed
            ? "flex h-[4.5rem] flex-col items-center justify-start gap-1 px-1 pb-2 pt-3"
            : "relative flex h-[4.5rem] items-stretch px-3",
        )}
      >
        {!collapsed ? (
          <>
            <div className="flex min-h-0 min-w-0 flex-1 items-center overflow-hidden py-1 pr-9">
              {clinicLogo()}
            </div>
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    className={cn(iconButtonClass, "absolute right-1 top-1/2 -translate-y-1/2")}
                    aria-label="Recolher menu"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Recolher</TooltipContent>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            {clinicLogo(true)}
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    className={iconButtonClass}
                    aria-label="Expandir menu"
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir</TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {renderNav(false)}
    </aside>
  );

  const mobileSidebar = (
    <aside className={cn(shellClass, "w-64")}>
      <div className="flex h-16 items-center justify-between rounded-t-2xl border-b border-sidebar-border bg-sidebar-header px-3">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden pr-1">
          {clinicLogo()}
        </div>
        <button
          type="button"
          onClick={onClose}
          className={iconButtonClass}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {renderNav(true)}
    </aside>
  );

  return (
    <>
      {modals}
      <div className="hidden shrink-0 py-2 pl-2 transition-all duration-300 sm:py-3 sm:pl-3 lg:py-4 lg:pl-5 md:flex">
        {desktopSidebar}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Fechar menu lateral"
          />
          <div className="relative z-10 h-full p-3 pr-0">{mobileSidebar}</div>
        </div>
      )}
    </>
  );
}
