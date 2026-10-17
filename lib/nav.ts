import {
  IconBell,
  IconBook2,
  IconFolder,
  IconHome,
  IconReceipt2,
  type Icon,
} from "@tabler/icons-react";

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  /** Other paths that should light up this item (e.g. the gateway return page). */
  match?: string[];
};

export const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/payments", label: "Payments", icon: IconReceipt2, match: ["/payment"] },
  { href: "/academics", label: "Academics", icon: IconBook2 },
  { href: "/updates", label: "Updates", icon: IconBell },
  { href: "/resources", label: "Resources", icon: IconFolder },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return [item.href, ...(item.match ?? [])].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
