"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  KeyRound,
  Link2,
  Shield,
  UserX,
  type LucideIcon,
} from "lucide-react";

type SecurityItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const securityItems: SecurityItem[] = [
  {
    label: "Redes vinculadas",
    href: "/profile/security/redes-vinculadas",
    icon: Link2,
  },
  {
    label: "Cambiar contraseña",
    href: "/profile/security/cambiar-contrasena",
    icon: KeyRound,
  },
  {
    label: "Verificación en dos pasos",
    href: "/profile/security/verificacion-en-dos-pasos",
    icon: BadgeCheck,
  },
  {
    label: "Desactivar cuenta",
    href: "/profile/security/desactivar-cuenta",
    icon: UserX,
  },
];

export default function SecuritySidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
          <Shield className="h-5 w-5 text-neutral-700" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Seguridad</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {securityItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-neutral-300 bg-neutral-100 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4",
                  isActive ? "text-orange-500" : "text-neutral-500",
                ].join(" ")}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
