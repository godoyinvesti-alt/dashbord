import {
  LayoutDashboard,
  Smartphone,
  ShieldCheck,
  ShoppingCart,
  Wallet,
  Bell,
  Settings,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Smartphone,
  ShieldCheck,
  ShoppingCart,
  Wallet,
  Bell,
  Settings,
  MoreHorizontal,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
