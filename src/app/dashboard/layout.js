'use client';

import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeProvider from '@/components/ThemeProvider';

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status !== 'loading') {
      setIsFirstLoad(false);
    }
  }, [status, router]);

  // Hanya tampilkan loading pada initial load
  if (isFirstLoad && status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}