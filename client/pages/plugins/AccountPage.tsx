import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { changePassword } from "@/controllers/authController";
import { toast } from "sonner";

export default function AccountPage() {
  const { t, i18n } = useTranslation();
  const { user, updateName } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [lang, setLang] = useState(i18n.language.startsWith("pl") ? "pl" : "en");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    i18n.changeLanguage(lang);
    const ok = await updateName(name.trim());
    if (ok) toast.success("Saved");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">{t("account.title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("account.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSave}>
            <div className="space-y-2">
              <Label htmlFor="name">{t("account.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("account.email")}</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t("account.language")}</Label>
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pl">🇵🇱 {t("nav.polish")}</SelectItem>
                  <SelectItem value="en">🇬🇧 {t("nav.english")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">{t("account.save")}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t("account.password")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (next !== confirm) return toast.error("Passwords do not match");
              const ok = await changePassword(current, next);
              if (ok) {
                setCurrent("");
                setNext("");
                setConfirm("");
                toast.success("Updated");
              } else toast.error("Invalid password");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="cur">{t("account.currentPassword")}</Label>
              <Input id="cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">{t("account.newPassword")}</Label>
              <Input id="new" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf">{t("account.confirmPassword")}</Label>
              <Input id="conf" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit">{t("account.updatePassword")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
