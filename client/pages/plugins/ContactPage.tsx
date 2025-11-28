import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("contact.title")}</h1>
        <p className="text-muted-foreground">{t("contact.description")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              {t("contact.email")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">support@foodexchange.pl</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("contact.emailDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="size-5" />
              {t("contact.phone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">+48 (12) 345-67-89</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("contact.phoneDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              {t("contact.address")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-lg font-medium">Food Exchange Platform</p>
              <p className="text-sm">ul. Handlowa 42</p>
              <p className="text-sm">00-001 Warszawa, Polska</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              {t("contact.businessHours")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p>{t("contact.mondayFriday")}: 9:00 - 17:00</p>
              <p>{t("contact.saturday")}: 10:00 - 14:00</p>
              <p>{t("contact.sunday")}: {t("contact.closed")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("contact.aboutUs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {t("contact.aboutText1")}
          </p>
          <p>
            {t("contact.aboutText2")}
          </p>
          <p>
            {t("contact.aboutText3")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
