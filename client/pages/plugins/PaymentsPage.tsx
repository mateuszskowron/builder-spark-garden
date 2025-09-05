import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchPayments } from "@/controllers/paymentsController";
import type { Payment } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }: { status: Payment["status"] }) {
  const { t } = useTranslation();
  const map: Record<Payment["status"], { label: string; className: string }> = {
    completed: { label: t("payments.completed"), className: "bg-emerald-100 text-emerald-900" },
    pending: { label: t("payments.pending"), className: "bg-amber-100 text-amber-900" },
    failed: { label: t("payments.failed"), className: "bg-red-100 text-red-900" },
  };
  const s = map[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments().then(setRows);
  }, []);

  const sum = useMemo(() => rows.reduce((acc, r) => acc + (r.status === "completed" ? r.amount : 0), 0), [rows]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("payments.title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{new Intl.NumberFormat(undefined, { style: "currency", currency: rows[0]?.currency || "PLN" }).format(sum)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payments.date")}</TableHead>
                  <TableHead>{t("payments.method")}</TableHead>
                  <TableHead>{t("payments.reference")}</TableHead>
                  <TableHead className="text-right">{t("invoices.amount")}</TableHead>
                  <TableHead>{t("payments.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{p.method}</TableCell>
                    <TableCell>{p.reference}</TableCell>
                    <TableCell className="text-right tabular-nums">{new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency }).format(p.amount)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
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
