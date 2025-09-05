import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/state/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AccountPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [lang, setLang] = useState(i18n.language.startsWith("pl") ? "pl" : "en");

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    i18n.changeLanguage(lang);
    alert("Saved");
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
    </div>
  );
}
