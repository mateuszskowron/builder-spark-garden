import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchPayments, createPayment } from "@/controllers/paymentsController";
import type { Payment } from "@/models/types";
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
import { toast } from "sonner";

function StatusBadge({ status }: { status: Payment["status"] }) {
  const { t } = useTranslation();
  const map: Record<Payment["status"], { label: string; className: string }> = {
    completed: {
      label: t("payments.completed"),
      className: "bg-emerald-100 text-emerald-900",
    },
    pending: {
      label: t("payments.pending"),
      className: "bg-amber-100 text-amber-900",
    },
    failed: {
      label: t("payments.failed"),
      className: "bg-red-100 text-red-900",
    },
  };
  const s = map[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Payment[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("PLN");
  const [method, setMethod] = useState<Payment["method"]>("card");
  const [reference, setReference] = useState<string>("");

  useEffect(() => {
    fetchPayments().then(setRows);
  }, []);

  const sum = useMemo(
    () =>
      rows.reduce(
        (acc, r) => acc + (r.status === "completed" ? r.amount : 0),
        0,
      ),
    [rows],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("payments.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("payments.newPayment")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 grid-cols-1 md:grid-cols-5 items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              const val = parseFloat(amount);
              if (!isFinite(val) || val <= 0 || !reference.trim()) return;
              const p = await createPayment({
                amount: val,
                currency,
                method,
                reference: reference.trim(),
              });
              setRows((r) => [p, ...r]);
              setAmount("");
              setReference("");
              toast.success("OK");
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="amount">
                {t("payments.amount")}
              </label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("payments.currency")}
              </label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLN">PLN</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("payments.method")}
              </label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as Payment["method"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    {t("payments.method_card")}
                  </SelectItem>
                  <SelectItem value="transfer">
                    {t("payments.method_transfer")}
                  </SelectItem>
                  <SelectItem value="blik">
                    {t("payments.method_blik")}
                  </SelectItem>
                  <SelectItem value="cash">
                    {t("payments.method_cash")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="ref">
                {t("payments.reference")}
              </label>
              <Input
                id="ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="FV/2024/004"
                required
              />
            </div>
            <div>
              <Button type="submit" className="w-full md:w-auto">
                {t("payments.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: rows[0]?.currency || "PLN",
            }).format(sum)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payments.date")}</TableHead>
                  <TableHead>{t("payments.method")}</TableHead>
                  <TableHead>{t("payments.reference")}</TableHead>
                  <TableHead className="text-right">
                    {t("invoices.amount")}
                  </TableHead>
                  <TableHead>{t("payments.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {new Date(p.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">{p.method}</TableCell>
                    <TableCell>{p.reference}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: p.currency,
                      }).format(p.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
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
