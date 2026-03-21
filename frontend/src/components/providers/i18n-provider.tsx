'use client';

import { ReactNode, useEffect, useState } from 'react';
import '@/src/locales'; // Initialize i18n

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Or a loader to avoid hidration mismatch
  }

  return <>{children}</>;
};
