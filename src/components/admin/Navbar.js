'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function AdminNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarStats, setSidebarStats] = useState({
    totalUsers: 0,
    todayAttendance: 0
  });
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    // Mock notifications - in a real app, fetch from API
    const mockNotifications = [
      { id: 1, message: 'Ada 5 peserta baru mendaftar hari ini', time: new Date(), read: false },
      { id: 2, message: 'Pengguna baru menunggu verifikasi identitas', time: new Date(Date.now() - 3600000), read: false },
      { id: 3, message: '12 pengguna belum melakukan presensi hari ini', time: new Date(Date.now() - 86400000), read: true }
    ];
    setNotifications(mockNotifications);

    // Fetch sidebar stats from API
    const fetchSidebarStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (response.ok) {
          const data = await response.json();
          setSidebarStats({
            totalUsers: data.totalUsers || 0,
            todayAttendance: data.todayAttendance || 0
          });
        }
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
        // Fallback to mock data
        setSidebarStats({
          totalUsers: 48,
          todayAttendance: 36
        });
      }
    };

    fetchSidebarStats();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/login'
    });
  };

  const navLinks = [
    { 
      name: 'Dashboard', 
      href: '/admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    { 
      name: 'Kelola Identitas', 
      href: '/admin/identities',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    },
    { 
      name: 'Data Presensi', 
      href: '/admin/attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Kelola Pengguna', 
      href: '/admin/users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'Kelola Tugas', 
      href: '/admin/tasks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  const isLinkActive = (href) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 md:hidden shadow-sm">
        <div className="px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 dark:text-gray-200">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-lg font-bold dark:text-white">Admin Panel</div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 border dark:border-gray-700"
                  >
                    <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                          Tandai semua sudah dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada notifikasi
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                          >
                            <div className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-2 mr-2 flex-shrink-0 ${!notification.read ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                              <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(notification.time).toLocaleTimeString('id-ID', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t dark:border-gray-700 text-center">
                      <button className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                        Lihat semua notifikasi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center">
              {session?.user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="h-16 px-4 border-b dark:border-gray-700 flex items-center justify-between">
                  <h1 className="text-xl font-bold dark:text-white">Admin Panel</h1>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="px-2 space-y-1">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          isLinkActive(link.href)
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className={`mr-3 ${isLinkActive(link.href) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {link.icon}
                        </div>
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="border-t dark:border-gray-700 p-4">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center px-4 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Kembali ke Aplikasi</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-left mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:dark:bg-gray-800 md:border-r md:dark:border-gray-700">
        <div className="flex flex-col h-full">
          <div className="h-16 px-6 border-b dark:border-gray-700 flex items-center">
            <h1 className="text-xl font-bold dark:text-white">Admin Panel</h1>
          </div>
          
          {/* User Profile */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center mr-3">
                {session?.user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{session?.user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email || 'admin@example.com'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-4 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isLinkActive(link.href)
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 font-medium'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`mr-3 ${isLinkActive(link.href) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {link.icon}
                  </div>
                  {link.name}
                  {link.name === 'Kelola Identitas' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Statistics Section */}
            <div className="mt-8 px-4">
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ringkasan
              </h3>
              <div className="mt-2 space-y-3">
                <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Pengguna</p>
                    <span className="text-blue-600 dark:text-blue-300 font-medium">{sidebarStats.totalUsers}</span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-800 rounded-full mt-2">
                    <div 
                      className="h-1.5 bg-blue-500 rounded-full" 
                      style={{ width: `${Math.min(sidebarStats.totalUsers / 50 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Presensi Hari Ini</p>
                    <span className="text-green-600 dark:text-green-300 font-medium">{sidebarStats.todayAttendance}</span>
                  </div>
                  <div className="w-full h-1.5 bg-green-100 dark:bg-green-800 rounded-full mt-2">
                    <div 
                      className="h-1.5 bg-green-500 rounded-full" 
                      style={{ width: `${sidebarStats.totalUsers ? Math.min(sidebarStats.todayAttendance / sidebarStats.totalUsers * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t dark:border-gray-700 p-4">
            <Link 
              href="/dashboard" 
              className="flex items-center px-4 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Kembali ke Aplikasi</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-left mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 