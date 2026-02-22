'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import FaceRecognition from '@/components/FaceRecognition';
import Link from 'next/link';

export default function CheckIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (session) {
      setLoading(false);
    }
  }, [session]);

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert('Check-in berhasil!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal melakukan check-in');
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Terjadi kesalahan saat check-in');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - BRIDA Theme */}
      <header className="bg-gradient-to-r from-rose-500 via-red-500 to-rose-500 shadow-lg py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer group"
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:text-rose-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-white font-semibold group-hover:text-rose-100 transition-colors">Kembali</span>
            </motion.div>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="text-white font-semibold">
              {session?.user?.name || 'User'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - BRIDA Theme */}
      <main className="flex-grow flex items-center justify-center p-6 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="max-w-2xl w-full">
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-rose-100"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            {/* Title with BRIDA Badge */}
            <div className="text-center mb-6">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full shadow-lg mb-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <span className="text-white font-bold text-sm tracking-wide">BRIDA KOTA SEMARANG</span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Check-in Kehadiran
              </motion.h1>
              
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Sistem Presensi Digital
              </motion.p>
            </div>
            
            <motion.div 
              className="rounded-xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <FaceRecognition 
                mode="verify" 
                purpose="check-in"
                onSuccess={handleCheckIn} 
              />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}