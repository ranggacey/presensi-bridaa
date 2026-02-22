'use client';

import Link from 'next/link';

export default function DashboardSidebar() {
  return (
    <div className="w-full shrink-0">
      <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-4 border border-sky-100 dark:border-gray-700 transition-all duration-300">
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2 p-3 rounded-xl bg-sky-50 dark:bg-gray-700/50 text-sky-500 dark:text-sky-400 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/dashboard/history" 
            className="flex items-center space-x-2 p-3 rounded-xl hover:bg-sky-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Riwayat Presensi</span>
          </Link>
          
          <Link 
            href="/dashboard/profile" 
            className="flex items-center space-x-2 p-3 rounded-xl hover:bg-sky-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profil</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}