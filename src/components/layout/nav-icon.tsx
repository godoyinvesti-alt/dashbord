import {
  LayoutDashboard,
  Users,
  Filter,
  ShoppingCart,
  CalendarClock,
  Package,
  Megaphone,
  Image as ImageIcon,
  Target,
  Wallet,
  Smartphone,
  UserCog,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Filter,
  ShoppingCart,
  CalendarClock,
  Package,
  Megaphone,
  Image: ImageIcon,
  Target,
  Wallet,
  Smartphone,
  UserCog,
  FileBarChart,
  Settings,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
