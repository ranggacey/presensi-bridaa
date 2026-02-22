'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function IdentityDetail() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/identities/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchUserData();
    }
  }, [params.id]);

  const handleExportToExcel = async () => {
    try {
      const response = await fetch(`/api/admin/export-identity?userId=${params.id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `biodata_${user.name.replace(/\s+/g, '_').toLowerCase()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor data ke Excel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mt-6">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={() => router.push('/admin/identities')}
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mt-6">
        <strong className="font-bold">Perhatian: </strong>
        <span className="block sm:inline">Data identitas tidak ditemukan.</span>
        <button 
          className="mt-4 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
          onClick={() => router.push('/admin/identities')}
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => router.push('/admin/identities')}
            className="mb-2 md:mb-0 inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detail Identitas Peserta</h1>
        </div>
        
        <motion.button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export ke Excel
        </motion.button>
      </div>
      
      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg flex-shrink-0 relative">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="text-blue-100 text-xl mt-1">{user.university || 'Belum diisi'}</p>
              <p className="text-blue-100 mt-1">
                {user.faculty} {user.studyProgram ? `• ${user.studyProgram}` : ''}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content sections */}
        <div className="p-6">
          {/* Personal Information */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Informasi Pribadi</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Nama Lengkap</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{user.name || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Tempat, Tanggal Lahir</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">
                  {user.birthPlace && user.birthDate 
                    ? `${user.birthPlace}, ${format(new Date(user.birthDate), 'dd MMMM yyyy', { locale: id })}` 
                    : (user.birthPlace || (user.birthDate ? format(new Date(user.birthDate), 'dd MMMM yyyy', { locale: id }) : '-'))}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Alamat</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{user.address || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Nomor Telepon</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{user.phoneNumber || '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Informasi Akademik</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Universitas</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{user.university || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Fakultas</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{user.faculty || '-'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Program Studi</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{user.studyProgram || '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Internship Information */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Informasi Magang</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400">Tanggal Mulai Magang</h4>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">
                  {user.internshipStartDate 
                    ? format(new Date(user.internshipStartDate), 'dd MMMM yyyy', { locale: id })
                    : '-'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Application Letter - Enhanced */}
          {user.applicationLetter && (
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Dokumen Surat Permohonan</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Surat Permohonan Magang</h4>
                      <p className="text-gray-600 dark:text-gray-300">Dokumen yang diupload oleh peserta magang</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Nama file: <span className="font-medium">{user.applicationLetter.split('/').pop()}</span></p>
                    </div>
                    
                    <div className="flex gap-2">
                      <a 
                        href={user.applicationLetter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Dokumen
                      </a>
                      
                      <a 
                        href={user.applicationLetter} 
                        download
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                  
                  {/* Document Preview */}
                  <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b dark:border-gray-600 flex justify-between items-center">
                      <h5 className="font-medium text-gray-700 dark:text-gray-200">Preview Dokumen</h5>
                      <a 
                        href={user.applicationLetter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Buka di tab baru
                      </a>
                    </div>
                    
                    <div className="h-96 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      {user.applicationLetter.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={`${user.applicationLetter}#toolbar=0&navpanes=0`} 
                          className="w-full h-full border-0"
                          title="PDF Preview"
                        />
                      ) : user.applicationLetter.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                        <div className="h-full w-full flex items-center justify-center p-4">
                          <img 
                            src={user.applicationLetter} 
                            alt="Dokumen Preview" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">Preview tidak tersedia untuk tipe dokumen ini</p>
                          <a 
                            href={user.applicationLetter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Buka dokumen untuk melihat
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!user.applicationLetter && (
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Dokumen Surat Permohonan</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-5 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex-shrink-0 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Surat Permohonan Belum Diunggah</h4>
                    <p className="text-gray-600 dark:text-gray-300">Peserta magang belum mengunggah dokumen surat permohonan</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 