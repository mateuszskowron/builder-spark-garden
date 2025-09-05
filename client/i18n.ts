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
        number: "Number",
        issueDate: "Issue date",
        dueDate: "Due date",
        amount: "Amount",
        status: "Status",
        paid: "Paid",
        unpaid: "Unpaid",
        overdue: "Overdue",
        filters: "Filters",
        from: "From",
        to: "To",
        clear: "Clear",
      },
      calendar: {
        title: "Calendar",
        upcoming: "Upcoming events",
      },
      messages: {
        title: "Messages",
        newMessagePlaceholder: "Type a message...",
      },
      payments: {
        title: "Payments",
        date: "Date",
        method: "Method",
        reference: "Reference",
        status: "Status",
        completed: "Completed",
        pending: "Pending",
        failed: "Failed",
        newPayment: "New payment",
        amount: "Amount",
        currency: "Currency",
        submit: "Pay",
        method_card: "Card",
        method_transfer: "Bank transfer",
        method_blik: "BLIK",
        method_cash: "Cash",
      },
      account: {
        title: "Account",
        name: "Name",
        email: "Email",
        language: "Language",
        save: "Save changes",
        password: "Password",
        currentPassword: "Current password",
        newPassword: "New password",
        confirmPassword: "Confirm password",
        updatePassword: "Update password",
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
        number: "Numer",
        issueDate: "Data wystawienia",
        dueDate: "Termin płatności",
        amount: "Kwota",
        status: "Status",
        paid: "Opłacona",
        unpaid: "Nieopłacona",
        overdue: "Przeterminowana",
        filters: "Filtry",
        from: "Od",
        to: "Do",
        clear: "Wyczyść",
      },
      calendar: {
        title: "Kalendarz",
        upcoming: "Nadchodzące wydarzenia",
      },
      messages: {
        title: "Wiadomości",
        newMessagePlaceholder: "Napisz wiadomość...",
      },
      payments: {
        title: "Płatności",
        date: "Data",
        method: "Metoda",
        reference: "Powiązanie",
        status: "Status",
        completed: "Zakończona",
        pending: "Oczekuje",
        failed: "Nieudana",
        newPayment: "Nowa płatność",
        amount: "Kwota",
        currency: "Waluta",
        submit: "Zapłać",
        method_card: "Karta",
        method_transfer: "Przelew bankowy",
        method_blik: "BLIK",
        method_cash: "Gotówka",
      },
      account: {
        title: "Konto",
        name: "Imię i nazwisko",
        email: "Email",
        language: "Język",
        save: "Zapisz zmiany",
        password: "Hasło",
        currentPassword: "Obecne hasło",
        newPassword: "Nowe hasło",
        confirmPassword: "Potwierdź hasło",
        updatePassword: "Zmień hasło",
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

// Keep <html lang> in sync for accessibility
i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
    document.documentElement.dir = "ltr";
  }
});

export default i18n;
