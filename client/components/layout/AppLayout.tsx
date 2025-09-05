import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { listAllPlugins } from "@/controllers/pluginsController";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const plugins = listAllPlugins();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <div className="size-6 rounded-md bg-primary text-primary-foreground grid place-items-center">
                PK
              </div>
              <span className="text-sm">{t("appName")}</span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.plugins")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {plugins.map((p) => (
                  <SidebarMenuItem key={p.id}>
                    <NavLink to={p.path} aria-label={t(p.titleKey)}>
                      {({ isActive }) => (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <div className="flex items-center gap-2">
                            {p.icon ? <p.icon className="size-4" /> : null}
                            <span>{t(p.titleKey)}</span>
                          </div>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between gap-2 px-2">
            <LanguageSwitcher />
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger aria-label="Toggle menu" />
              <Separator orientation="vertical" className="mx-2 h-6" />
              <span className="text-sm text-muted-foreground">
                {t("appName")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="sr-only" id="user-menu-label">
                User menu
              </span>
              <div
                className="flex items-center gap-2"
                aria-labelledby="user-menu-label"
              >
                <Avatar>
                  <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-sm">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-muted-foreground">{user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  {t("nav.logout")}
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className={cn("p-4", location.pathname === "/" ? "" : "")}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
