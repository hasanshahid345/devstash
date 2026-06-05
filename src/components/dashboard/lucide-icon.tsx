import { createElement } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getLucideIcon(iconName: string) {
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons];

  return (typeof Icon === "function" ? Icon : LucideIcons.Circle) as LucideIcon;
}

export function DashboardLucideIcon({
  iconName,
  className,
}: {
  iconName: string;
  className: string;
}) {
  return createElement(getLucideIcon(iconName), { className });
}
