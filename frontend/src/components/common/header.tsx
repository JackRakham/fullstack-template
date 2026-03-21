"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/src/components/common/theme-toggle";
import { UserMenu } from "@/src/components/common/user-menu";
import { ROUTES } from "@/src/config/routes";
import { useAuthStore } from "@/src/stores/auth.store";

export function Header() {
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-zinc-950/95 dark:border-zinc-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="font-bold text-xl tracking-tight">
          Trucking App
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link href={ROUTES.AUTH.LOGIN} className="text-sm font-medium hover:underline">
              <Button variant="ghost" size="sm">
                {t('common:login', 'Login')}
              </Button>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
