import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language.startsWith("pl") ? "pl" : "en";

  return (
    <Select value={current} onValueChange={(val) => i18n.changeLanguage(val)} aria-label={t("nav.language")}>
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue placeholder={t("nav.language")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pl">🇵🇱 {t("nav.polish")}</SelectItem>
        <SelectItem value="en">🇬🇧 {t("nav.english")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
