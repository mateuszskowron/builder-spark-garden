import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FolderGit2, FileText, CalendarDays, MessagesSquare } from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const items = [
    { icon: FolderGit2, title: t("nav.cases"), to: "/cases", color: "bg-blue-600" },
    { icon: FileText, title: t("nav.invoices"), to: "/invoices", color: "bg-emerald-600" },
    { icon: CalendarDays, title: t("nav.calendar"), to: "/calendar", color: "bg-violet-600" },
    { icon: MessagesSquare, title: t("nav.messages"), to: "/messages", color: "bg-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("dashboard.welcome", { name: user?.name ?? "" })}</h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((it) => (
          <Card key={it.title} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{it.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className={`size-10 rounded-md grid place-items-center text-white ${it.color}`}>
                <it.icon className="size-5" />
              </div>
              <Button asChild variant="secondary">
                <Link to={it.to}>{t("dashboard.viewAll")}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
