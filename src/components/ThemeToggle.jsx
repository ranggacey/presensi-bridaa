'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Mengatasi hydration mismatch dengan next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Selalu tampilkan ikon matahari karena tema dipaksa ke light mode
  return (
    <div
      className="p-2 rounded-full bg-white/90 shadow-soft backdrop-blur-sm flex items-center justify-center"
      aria-label="Light mode active"
    >
      <Sun className="w-5 h-5 text-amber-400" />
      <span className="sr-only">Light Mode Active</span>
    </div>
  );
}