import './globals.css';
import AuthProvider from './AuthProvider';
import ThemeProvider from '@/components/ThemeProvider';
import { ProfileImageProvider } from '@/components/ProfileImageContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Sistem Presensi',
  description: 'Aplikasi sistem presensi icikiwir',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Script untuk menghindari flicker tema */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var storageKey = 'theme';
              var theme = localStorage.getItem(storageKey);
              var systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              var preferredTheme = theme || systemPreference;
              
              if (preferredTheme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
            
            // Global error handler untuk unhandled promise rejections
            window.addEventListener('unhandledrejection', function(event) {
              console.warn('Unhandled promise rejection caught:', event.reason);
              // Prevent default browser error logging
              event.preventDefault();
            });
          })();
        `}} />
      </head>
      <body className="antialiased dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <ProfileImageProvider>
              <div className="relative min-h-screen">
                {/* Background effect */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                </div>
                {children}
              </div>
            </ProfileImageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}