'use client';

import { useAuthStore } from '@/src/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { user_type, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user_type !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user_type, router]);

  if (user_type !== 'ADMIN') {
    return null; // Return null while redirecting
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Developer / Admin Panel</h2>
        <div className="flex items-center space-x-2">
          {/* Action buttons could go here */}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">System Status</h3>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">Online</div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
