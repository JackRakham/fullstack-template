"use client";

import { useAuthStore } from "@/src/stores/auth.store";
import { Button } from "@/src/components/ui/button";
import { User, LogOut, Settings, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/src/config/routes";
import { useState } from "react";
import Image from "next/image";

export function UserMenu() {
  const { user, user_type, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Priority: Local Media -> Google URL -> Placeholder
  const avatarSrc = user.avatar?.url || user.avatar_url;
  const initials = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border overflow-hidden hover:ring-2 hover:ring-primary transition-all"
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={user.name || 'User'}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium">{initials}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white p-1 shadow-md dark:bg-zinc-950 z-50 animate-in fade-in zoom-in duration-200">
            <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs font-normal text-zinc-500">{user.email}</span>
              </div>
            </div>
            
            {user_type === 'ADMIN' && (
              <Link href="/admin" onClick={() => setIsOpen(false)}>
                <div className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm cursor-pointer transition-colors text-primary">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Panel de Administración</span>
                </div>
              </Link>
            )}

            <Link href="/settings/profile" onClick={() => setIsOpen(false)}>
              <div className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm cursor-pointer transition-colors">
                <Settings className="h-4 w-4" />
                <span>Perfil y Ajustes</span>
              </div>
            </Link>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
