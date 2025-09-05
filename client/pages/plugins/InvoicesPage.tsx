import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchInvoices } from "@/controllers/invoicesController";
import type { Invoice } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const { t } = useTranslation();
  const map: Record<Invoice["status"], { label: string; className: string }> = {
    paid: { label: t("invoices.paid"), className: "bg-emerald-100 text-emerald-900" },
    unpaid: { label: t("invoices.unpaid"), className: "bg-amber-100 text-amber-900" },
    overdue: { label: t("invoices.overdue"), className: "bg-red-100 text-red-900" },
  };
  const s = map[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchInvoices().then(setInvoices);
  }, []);

  const filtered = useMemo(
    () =>
      invoices.filter((i) =>
        [i.number, i.status, i.amount, i.currency].join(" ").toString().toLowerCase().includes(q.toLowerCase()),
      ),
    [invoices, q],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("invoices.title")}</h1>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("cases.searchPlaceholder")} aria-label={t("cases.searchPlaceholder")} className="max-w-xs" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("invoices.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoices.number")}</TableHead>
                  <TableHead>{t("invoices.issueDate")}</TableHead>
                  <TableHead>{t("invoices.dueDate")}</TableHead>
                  <TableHead className="text-right">{t("invoices.amount")}</TableHead>
                  <TableHead>{t("invoices.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.number}</TableCell>
                    <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {new Intl.NumberFormat(undefined, { style: "currency", currency: inv.currency }).format(inv.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
