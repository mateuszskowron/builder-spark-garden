import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    common: {
      appName: "Customer Panel",
      login: {
        title: "Sign in to your account",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        submit: "Sign in",
        noAccount: "Don't have an account?",
        error: "Invalid credentials",
      },
      nav: {
        dashboard: "Dashboard",
        cases: "Cases",
        invoices: "Invoices",
        calendar: "Calendar",
        messages: "Messages",
        documents: "Documents",
        payments: "Payments",
        complaints: "Complaints",
        reports: "Reports",
        settings: "Settings",
        account: "Account",
        plugins: "Plugins",
        logout: "Log out",
        language: "Language",
        polish: "Polish",
        english: "English",
      },
      dashboard: {
        welcome: "Welcome, {{name}}",
        overview: "Overview",
        quickActions: "Quick actions",
        viewAll: "View all",
      },
      cases: {
        title: "Cases",
        searchPlaceholder: "Search cases...",
        status: {
          open: "Open",
          inProgress: "In progress",
          closed: "Closed",
        },
      },
      invoices: {
        title: "Invoices",
      },
      placeholder: {
        building: "This section is a placeholder. Ask to generate full content.",
      },
    },
  },
  pl: {
    common: {
      appName: "Panel Klienta",
      login: {
        title: "Zaloguj się do konta",
        email: "Email",
        password: "Hasło",
        rememberMe: "Zapamiętaj mnie",
        submit: "Zaloguj",
        noAccount: "Nie masz konta?",
        error: "Nieprawidłowe dane logowania",
      },
      nav: {
        dashboard: "Pulpit",
        cases: "Sprawy",
        invoices: "Faktury",
        calendar: "Kalendarz",
        messages: "Wiadomości",
        documents: "Dokumenty",
        payments: "Płatności",
        complaints: "Reklamacje",
        reports: "Raporty",
        settings: "Ustawienia",
        account: "Konto",
        plugins: "Wtyczki",
        logout: "Wyloguj",
        language: "Język",
        polish: "Polski",
        english: "Angielski",
      },
      dashboard: {
        welcome: "Witaj, {{name}}",
        overview: "Przegląd",
        quickActions: "Szybkie akcje",
        viewAll: "Zobacz wszystkie",
      },
      cases: {
        title: "Sprawy",
        searchPlaceholder: "Szukaj spraw...",
        status: {
          open: "Otwarte",
          inProgress: "W toku",
          closed: "Zamknięte",
        },
      },
      invoices: {
        title: "Faktury",
      },
      placeholder: {
        building: "Ta sekcja to placeholder. Poproś o wygenerowanie pełnej zawartości.",
      },
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pl",
    supportedLngs: ["pl", "en"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;
