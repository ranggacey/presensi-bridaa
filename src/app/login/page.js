'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { data: session } = useSession();
  
  // Redirect jika sudah login
  useEffect(() => {
    if (session) {
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, router]);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      if (result.error) {
        setError('Username atau password salah');
        setLoading(false);
        return;
      }
      
      // Session akan diperbarui secara otomatis oleh next-auth
      // useEffect di atas akan menangani redirect
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };
  
  // Animasi untuk elemen-elemen UI
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
      <motion.div 
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Card dengan efek Neumorphism */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mx-auto backdrop-blur-sm border border-gray-100 transition-all duration-300">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mx-auto mb-4 flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 shadow-soft-lg flex items-center justify-center overflow-hidden border border-sky-100/60 dark:border-gray-700/80">
                <img
                  src="https://i.ibb.co/gLn3DK19/brida.png"
                  alt="Logo BRIDA Kota Semarang"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-300 uppercase">
                Badan Riset dan Inovasi Daerah Kota Semarang
              </p>
            </div>
            <div className="mx-auto w-16 h-16 mb-3 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center">
              <LogIn className="w-8 h-8 text-sky-500 dark:text-sky-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Selamat Datang</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Masuk ke akun Sistem Presensi BRIDA</p>
          </motion.div>
          
          {error && (
            <motion.div 
              variants={itemVariants}
              className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 dark:bg-gray-700/50 border border-sky-100 dark:border-gray-600 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 dark:bg-gray-700/50 border border-sky-100 dark:border-gray-600 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-medium rounded-xl shadow-soft-md hover:shadow-soft-lg transform hover:scale-[1.01] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  'Masuk'
                )}
              </button>
            </motion.div>
          </form>
          
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-medium transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants} className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Sistem Presensi Modern. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
}