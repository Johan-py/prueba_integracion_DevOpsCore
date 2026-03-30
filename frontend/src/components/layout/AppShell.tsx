"use client";

import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SessionManager />
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-8">{children}</main>
      <Footer />
    </>
  )
}
