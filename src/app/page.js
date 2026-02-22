'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center p-6 md:p-8">
            <img
              src="https://i.ibb.co/gLn3DK19/brida.png"
              alt="Logo BRIDA Kota Semarang"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
          Sistem Presensi BRIDA
        </h1>
        
        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-600 font-medium mb-2">
          Badan Riset dan Inovasi Daerah
        </p>
        <p className="text-sm md:text-base text-gray-500 mb-10">
          Kota Semarang
        </p>

        {/* Button Mulai */}
        <Link href="/login">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-sky-500 dark:bg-sky-600 text-white font-semibold text-lg py-4 px-12 rounded-xl shadow-lg hover:bg-sky-600 dark:hover:bg-sky-700 hover:shadow-xl transition-all duration-200"
          >
            <span>Mulai</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </Link>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Sistem Presensi BRIDA Kota Semarang
          </p>
        </div>
      </motion.div>
    </main>
  );
}