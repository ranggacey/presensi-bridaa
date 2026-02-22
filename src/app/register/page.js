'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    registrationCode: '',
    role: 'user' // Default role adalah user
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validasi username
    if (!formData.username.trim()) {
      newErrors.username = 'Username tidak boleh kosong';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username minimal 4 karakter';
    }
    
    // Validasi password
    if (!formData.password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    // Validasi konfirmasi password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    // Validasi nama
    if (!formData.name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong';
    }
    
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validasi registration code
    if (!formData.registrationCode.trim()) {
      newErrors.registrationCode = 'Kode registrasi tidak boleh kosong';
    } else if (!/^\d{6}$/.test(formData.registrationCode)) {
      newErrors.registrationCode = 'Kode registrasi harus 6 digit angka';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Tampilkan error detail yang lebih spesifik
        let errorMessage = data.message || 'Terjadi kesalahan saat mendaftar';
        
        // Deteksi berbagai jenis error dan berikan pesan yang lebih jelas
        if (errorMessage.includes('bad auth') || errorMessage.includes('authentication failed')) {
          errorMessage = '❌ Error Database: Koneksi ke database gagal. Kemungkinan penyebab:\n\n• Username atau password MongoDB tidak valid\n• IP Address belum diwhitelist di MongoDB Atlas\n• Koneksi internet bermasalah\n\nSilakan hubungi administrator.';
        } else if (errorMessage.includes('Username sudah digunakan')) {
          errorMessage = '⚠️ Username "' + formData.username + '" sudah terdaftar. Silakan gunakan username lain.';
        } else if (errorMessage.includes('Email sudah digunakan')) {
          errorMessage = '⚠️ Email "' + formData.email + '" sudah terdaftar. Silakan gunakan email lain atau login.';
        } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ETIMEDOUT')) {
          errorMessage = '🌐 Koneksi ke server database gagal. Periksa koneksi internet Anda.';
        }
        
        throw new Error(errorMessage);
      }
      
      setMessage({
        type: 'success',
        text: '✅ Pendaftaran berhasil! Anda akan dialihkan ke halaman login.'
      });
      
      // Redirect ke halaman login setelah 2 detik
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message
      });
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 mx-auto backdrop-blur-sm border border-sky-100 dark:border-gray-700 transition-all duration-300">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mx-auto mb-4 flex flex-col items-center space-y-3">
              <div className="w-28 h-28 rounded-3xl bg-white dark:bg-gray-900 shadow-soft-lg flex items-center justify-center overflow-hidden border border-sky-100/60 dark:border-gray-700/80">
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Buat Akun Baru</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Daftar untuk mengakses Sistem Presensi BRIDA</p>
          </motion.div>
          
          {message.text && (
            <motion.div 
              variants={itemVariants}
              className={`mb-6 p-4 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300'} text-sm rounded flex items-start gap-2`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <span className="whitespace-pre-line">{message.text}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl ${errors.name ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-sky-50 dark:bg-gray-700/50 border-sky-100 dark:border-gray-600'} focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl ${errors.email ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-sky-50 dark:bg-gray-700/50 border-sky-100 dark:border-gray-600'} focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white`}
                  placeholder="Masukkan email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl ${errors.username ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-sky-50 dark:bg-gray-700/50 border-sky-100 dark:border-gray-600'} focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white`}
                  placeholder="Masukkan username"
                />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl ${errors.password ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-sky-50 dark:bg-gray-700/50 border-sky-100 dark:border-gray-600'} focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white`}
                  placeholder="Masukkan password"
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
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl ${errors.confirmPassword ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-sky-50 dark:bg-gray-700/50 border-sky-100 dark:border-gray-600'} focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white`}
                  placeholder="Konfirmasi password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-6">
              <label htmlFor="registrationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kode Registrasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="registrationCode"
                  name="registrationCode"
                  type="text"
                  value={formData.registrationCode}
                  onChange={handleChange}
                  maxLength={6}
                  className={`w-full px-4 py-3 rounded-xl ${errors.registrationCode ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-sky-50 dark:bg-gray-700/50 border-sky-100 dark:border-gray-600'} focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700 outline-none transition-all duration-300 text-gray-800 dark:text-white text-center text-2xl font-bold tracking-widest`}
                  placeholder="000000"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              {errors.registrationCode && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.registrationCode}</p>}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Masukkan kode registrasi 6 digit yang diberikan oleh admin
              </p>
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
                  'Daftar'
                )}
              </button>
            </motion.div>
          </form>
          
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sudah punya akun?{' '}
              <Link 
                href="/login" 
                className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-medium transition-colors"
              >
                Masuk sekarang
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