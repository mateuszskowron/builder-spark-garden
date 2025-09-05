import { type PluginDefinition } from "@/models/types";
import {
  House,
  FolderGit2,
  FileText,
  CalendarDays,
  MessagesSquare,
  FileStack,
  CreditCard,
  CircleAlert,
  BarChart3,
  Cog,
  User as UserIcon,
} from "lucide-react";

export function getBuiltinPlugins(): PluginDefinition[] {
  return [
    { id: "dashboard", path: "/", titleKey: "nav.dashboard", icon: House },
    { id: "cases", path: "/cases", titleKey: "nav.cases", icon: FolderGit2 },
    { id: "invoices", path: "/invoices", titleKey: "nav.invoices", icon: FileText },
    { id: "calendar", path: "/calendar", titleKey: "nav.calendar", icon: CalendarDays },
    { id: "messages", path: "/messages", titleKey: "nav.messages", icon: MessagesSquare },
    { id: "documents", path: "/documents", titleKey: "nav.documents", icon: FileStack },
    { id: "payments", path: "/payments", titleKey: "nav.payments", icon: CreditCard },
    { id: "complaints", path: "/complaints", titleKey: "nav.complaints", icon: CircleAlert },
    { id: "reports", path: "/reports", titleKey: "nav.reports", icon: BarChart3 },
    { id: "settings", path: "/settings", titleKey: "nav.settings", icon: Cog },
    { id: "account", path: "/account", titleKey: "nav.account", icon: UserIcon },
  ];
}

// Simple plugin registry to allow runtime registration
let extraPlugins: PluginDefinition[] = [];

export function registerPlugin(plugin: PluginDefinition) {
  extraPlugins = [...extraPlugins, plugin];
}

export function listAllPlugins(): PluginDefinition[] {
  return [...getBuiltinPlugins(), ...extraPlugins];
}
