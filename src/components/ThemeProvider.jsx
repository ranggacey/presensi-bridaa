'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" enableSystem={false} defaultTheme="light" forcedTheme="light">
      {children}
    </NextThemesProvider>
  );
}