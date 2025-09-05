import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchCases } from "@/controllers/casesController";
import type { Case } from "@/models/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }: { status: Case["status"] }) {
  const { t } = useTranslation();
  const map: Record<Case["status"], { label: string; className: string }> = {
    open: {
      label: t("cases.status.open"),
      className: "bg-blue-100 text-blue-900",
    },
    inProgress: {
      label: t("cases.status.inProgress"),
      className: "bg-amber-100 text-amber-900",
    },
    closed: {
      label: t("cases.status.closed"),
      className: "bg-emerald-100 text-emerald-900",
    },
  };
  const s = map[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export default function CasesPage() {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCases().then(setCases);
  }, []);

  const filtered = cases.filter((c) =>
    [c.id, c.title, c.description]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("cases.title")}</h1>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("cases.searchPlaceholder")}
          className="max-w-xs"
          aria-label={t("cases.searchPlaceholder")}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.title}</CardTitle>
                <StatusBadge status={c.status} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {c.description}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <span>#{c.id}</span>
                <span className="mx-2">•</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
