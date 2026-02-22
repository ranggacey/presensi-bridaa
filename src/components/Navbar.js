'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if scrolled down
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Hide/show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className={cn(
                "font-bold text-xl transition-colors",
                scrolled ? "text-primary-500" : "text-dark"
              )}>
                Sistem Presensi
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-1">
              <NavLink href="/dashboard" scrolled={scrolled}>Dashboard</NavLink>
              <NavLink href="/dashboard/history" scrolled={scrolled}>Riwayat Presensi</NavLink>
              <NavLink href="/dashboard/profile" scrolled={scrolled}>Profil</NavLink>
            </div>
          </div>
          <div className="hidden md:flex md:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className={cn(
                  "mr-3 font-medium transition-colors",
                  scrolled ? "text-dark" : "text-dark/80"
                )}>
                  {session?.user?.name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="relative px-4 py-2 rounded-full overflow-hidden group bg-primary-500 hover:bg-primary-600 transition-all duration-300"
                >
                  <span className="relative z-10 text-white text-sm font-medium">Logout</span>
                  <div className="absolute inset-0 scale-0 rounded-full bg-primary-600 group-hover:scale-100 transition-transform duration-300 ease-in-out" />
                </button>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "inline-flex items-center justify-center p-2 rounded-md transition-colors",
                scrolled ? "text-dark hover:bg-primary-50" : "text-dark/80 hover:bg-white/20",
                "focus:outline-none"
              )}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-xl overflow-hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
            <MobileNavLink href="/dashboard/history" onClick={() => setIsMenuOpen(false)}>Riwayat Presensi</MobileNavLink>
            <MobileNavLink href="/dashboard/profile" onClick={() => setIsMenuOpen(false)}>Profil</MobileNavLink>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium text-dark">{session?.user?.name || 'User'}</div>
                  <div className="text-sm font-medium text-gray-500">{session?.user?.email || ''}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children, scrolled }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 overflow-hidden group",
        scrolled ? "text-dark hover:text-primary-500" : "text-dark/80 hover:text-dark"
      )}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-primary-50 transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}