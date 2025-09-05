import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchInvoices } from "@/controllers/invoicesController";
import type { Invoice } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const { t } = useTranslation();
  const map: Record<Invoice["status"], { label: string; className: string }> = {
    paid: {
      label: t("invoices.paid"),
      className: "bg-emerald-100 text-emerald-900",
    },
    unpaid: {
      label: t("invoices.unpaid"),
      className: "bg-amber-100 text-amber-900",
    },
    overdue: {
      label: t("invoices.overdue"),
      className: "bg-red-100 text-red-900",
    },
  };
  const s = map[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Invoice["status"] | "all">("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    fetchInvoices().then(setInvoices);
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const textMatch = [i.number, i.status, i.amount, i.currency]
        .join(" ")
        .toString()
        .toLowerCase()
        .includes(q.toLowerCase());
      const statusMatch = status === "all" ? true : i.status === status;
      const fromMatch = from ? new Date(i.issueDate) >= new Date(from) : true;
      const toMatch = to ? new Date(i.issueDate) <= new Date(to) : true;
      return textMatch && statusMatch && fromMatch && toMatch;
    });
  }, [invoices, q, status, from, to]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("invoices.title")}</h1>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("cases.searchPlaceholder")}
          aria-label={t("cases.searchPlaceholder")}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("invoices.filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("invoices.status")}
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">{t("invoices.paid")}</SelectItem>
                  <SelectItem value="unpaid">{t("invoices.unpaid")}</SelectItem>
                  <SelectItem value="overdue">
                    {t("invoices.overdue")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="from">
                {t("invoices.from")}
              </label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="to">
                {t("invoices.to")}
              </label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setFrom("");
                  setTo("");
                }}
              >
                {t("invoices.clear")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead className="text-right">
                    {t("invoices.amount")}
                  </TableHead>
                  <TableHead>{t("invoices.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.number}</TableCell>
                    <TableCell>
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: inv.currency,
                      }).format(inv.amount)}
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
