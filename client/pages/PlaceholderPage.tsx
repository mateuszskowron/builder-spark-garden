import { useTranslation } from "react-i18next";

export default function PlaceholderPage({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <div className="grid place-items-center py-20">
      <div className="max-w-xl text-center space-y-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{t("placeholder.building")}</p>
      </div>
    </div>
  );
}
