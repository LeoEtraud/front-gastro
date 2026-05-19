import { useState } from "react";
import { type LucideIcon, BookOpen, FileText, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TermsOfUseModal } from "@/components/common/TermsOfUseModal";
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
    "flex cursor-pointer items-center rounded-xl transition-colors",
    collapsed && !mobile ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
    isActive
      ? "bg-sidebar-active font-semibold text-sidebar-active-foreground shadow-md"
      : "font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
  const [termsOpen, setTermsOpen] = useState(false);

  const footer = (mobile: boolean) => (
    <div
      className={cn(
        "mt-auto border-t border-sidebar-border pt-4",
        collapsed && !mobile ? "px-2" : "px-3",
      )}
    >
      {!collapsed || mobile ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="block w-full text-center text-xs font-medium text-sidebar-foreground/90 transition-colors hover:text-sidebar-foreground"
          >
            Termos de Uso e Privacidade
          </button>
          <p className="text-center text-xs font-medium text-sidebar-muted">Versão {APP_VERSION}</p>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className={cn(iconButtonClass, "flex w-full justify-center")}
              aria-label="Termos de uso"
            >
              <FileText className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Termos de uso</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const renderNav = (mobile = false) => (
    <nav className={cn("flex flex-1 flex-col overflow-y-auto py-4", collapsed && !mobile ? "px-2" : "px-3")}>
      <ul className="flex-1 space-y-1.5">
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
    "flex h-full flex-col rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-all duration-300",
  );

  const logoIcon = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gc-teal to-gc-coral">
      <BookOpen className="h-[18px] w-[18px] text-white" aria-hidden />
    </span>
  );

  const desktopSidebar = (
    <aside className={cn(shellClass, collapsed ? "w-[4.5rem]" : "w-64")}>
      <div
        className={cn(
          "shrink-0 rounded-t-2xl border-b border-sidebar-border bg-sidebar-header",
          collapsed
            ? "flex h-16 items-center justify-center gap-1 px-1.5"
            : "flex h-16 items-center px-3",
        )}
      >
        {!collapsed ? (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {logoIcon}
              <span className="truncate font-display text-lg font-bold text-sidebar-foreground">GastroCentro</span>
            </div>
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    className={cn(iconButtonClass, "ml-auto")}
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
            {logoIcon}
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
        <div className="flex min-w-0 items-center gap-2">
          {logoIcon}
          <span className="truncate font-display text-lg font-bold text-sidebar-foreground">GastroCentro</span>
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
      <TermsOfUseModal open={termsOpen} onOpenChange={setTermsOpen} />
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
