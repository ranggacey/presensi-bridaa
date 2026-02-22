'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import ThemeToggle from '@/components/ThemeToggle';
import { useProfileImage } from '@/components/ProfileImageContext';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const { profileImage } = useProfileImage();
  
  // Mengatasi hydration mismatch
  useEffect(() => {
    // Set waktu dan tanggal saat ini
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const updateDateTime = () => {
    const now = new Date();
    
    // Format waktu: HH:MM:SS
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    setCurrentTime(now.toLocaleTimeString('id-ID', timeOptions));
    
    // Format tanggal: Hari, DD Bulan YYYY
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('id-ID', dateOptions));
  };

  return (
    <>
      {/* Header - Fixed position tanpa efek scroll */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-sky-100 dark:border-gray-800 transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-sky-50 dark:bg-gray-800 text-sky-500 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 shadow-soft-lg flex items-center justify-center overflow-hidden border border-sky-100/70 dark:border-gray-700/80">
                  <Image
                    src="/images/brida.png"
                    alt="Logo BRIDA Kota Semarang"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <h1 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Sistem Presensi BRIDA
                  </h1>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-300 uppercase tracking-wide">
                    Kota Semarang
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/dashboard/history">Riwayat</NavLink>
              <NavLink href="/dashboard/profile">Profil</NavLink>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{currentTime}</span>
              </div>
              <div className="relative">
                <NotificationBell />
              </div>
              
              {/* User dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-sky-400 to-sky-500 flex items-center justify-center text-white font-medium">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={session?.user?.name || "User"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      session?.user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-800 dark:text-white">
                    {session?.user?.name || 'User'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg py-2 border border-sky-100 dark:border-gray-800 z-20">
                    <div className="px-4 py-2 border-b border-sky-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{session?.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email || ''}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        href="/dashboard/profile" 
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profil Saya</span>
                      </Link>
                    </div>
                    
                    <div className="py-1 border-t border-sky-100 dark:border-gray-800">
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div 
            className="w-72 h-full bg-white dark:bg-gray-900 shadow-xl p-5 overflow-y-auto animate-slide-in-left"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full bg-sky-50 dark:bg-gray-800 text-sky-500 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-sky-50 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-sky-400 to-sky-500 flex items-center justify-center text-white font-medium">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={session?.user?.name || "User"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session?.user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email || ''}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">Menu Utama</p>
              <nav className="space-y-1">
                <MobileNavLink 
                  href="/dashboard" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                
                <MobileNavLink 
                  href="/dashboard/profile" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </MobileNavLink>
                
                <MobileNavLink 
                  href="/dashboard/history" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Riwayat Presensi
                </MobileNavLink>
              </nav>
            </div>
            
            <div className="pt-4 mt-6 border-t border-sky-100 dark:border-gray-800">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className="flex items-center space-x-2 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Komponen NavLink untuk menu desktop
function NavLink({ href, children }) {
  return (
    <Link 
      href={href} 
      className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400 font-medium transition-colors group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

// Komponen MobileNavLink untuk menu mobile
function MobileNavLink({ href, children, icon, onClick }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors"
      onClick={onClick}
    >
      <div className="text-sky-500">{icon}</div>
      <span className="font-medium">{children}</span>
    </Link>
  );
}