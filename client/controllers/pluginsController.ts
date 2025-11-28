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
  Building2,
  Users,
  ClipboardList,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

export function getBuiltinPlugins(): PluginDefinition[] {
  return [
    { id: "dashboard", path: "/", titleKey: "nav.dashboard", icon: House },
    {
      id: "invoices",
      path: "/invoices",
      titleKey: "nav.invoices",
      icon: FileText,
    },
    {
      id: "payments",
      path: "/payments",
      titleKey: "nav.payments",
      icon: CreditCard,
    },
    {
      id: "account",
      path: "/account",
      titleKey: "nav.account",
      icon: UserIcon,
    },
    {
      id: "companies",
      path: "/companies",
      titleKey: "nav.companies",
      icon: Building2,
      requiredRole: ["admin"],
    },
    {
      id: "users",
      path: "/users",
      titleKey: "nav.users",
      icon: Users,
      requiredRole: ["admin"],
    },
    {
      id: "registration-requests",
      path: "/registration-requests",
      titleKey: "nav.registrationRequests",
      icon: ClipboardList,
      requiredRole: ["admin"],
    },
    {
      id: "sales",
      path: "/sales",
      titleKey: "nav.sales",
    },
    {
      id: "purchases",
      path: "/purchases",
      titleKey: "nav.purchases",
    },
    {
      id: "my-listings",
      path: "/my-listings",
      titleKey: "nav.myListings",
    },
    {
      id: "chat",
      path: "/chat",
      titleKey: "nav.chat",
      icon: MessageCircle,
    },
    {
      id: "contact",
      path: "/contact",
      titleKey: "nav.contact",
      icon: HelpCircle,
    },
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
