'use client';

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/components/ui/button";
import { MoveRight, Truck, Shield, BarChart3 } from "lucide-react";

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-3 duration-1000">
          <Truck className="size-4" />
          <span>V1.0.0 Now Live</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {t('common:welcome')}
        </h1>
        
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
          {t('common:dashboardDescription')}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <Link href="/identity/users">
            <Button size="lg" className="h-12 px-8 text-base font-semibold group">
              {t('common:goToDashboard')}
              <MoveRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
            {t('common:actions')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="flex flex-col items-center p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <Shield className="size-6" />
            </div>
            <h3 className="font-bold mb-2">Secure Identity</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Advanced RBAC and user management out of the box.</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mb-4">
              <Truck className="size-6" />
            </div>
            <h3 className="font-bold mb-2">Fleet Logistics</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Track and manage your trucking operations in real-time.</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mb-4">
              <BarChart3 className="size-6" />
            </div>
            <h3 className="font-bold mb-2">Real-time Analytics</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Monitor performance with beautiful, modular charts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
