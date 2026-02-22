'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import { id } from 'date-fns/locale';
import DashboardNavbar from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';
import 'react-datepicker/dist/react-datepicker.css';
import FaceRecognition from '@/components/FaceRecognition';
import { useProfileImage } from '@/components/ProfileImageContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '', details: '' });
  const [profileData, setProfileData] = useState({
    name: '',
    profileImage: '',
    birthDate: '',
    birthPlace: '',
    address: '',
    university: '',
    faculty: '',
    studyProgram: '',
    internshipStartDate: null,
    phoneNumber: '',
    applicationLetter: ''
  });
  const [faceRegistered, setFaceRegistered] = useState(false);
  const { updateProfileImage } = useProfileImage();

  useEffect(() => {
    if (session) {
      fetchUserProfile();
      checkFaceData();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      // Hanya tampilkan loading saat pertama kali load halaman
      if (loading) {
        setLoading(true);
      }
      
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const data = await response.json();
        
        // Parse string dates to Date objects if they exist
        const parsedData = {
          ...data.user,
          internshipStartDate: data.user.internshipStartDate ? parse(data.user.internshipStartDate, 'dd-MM-yyyy', new Date()) : null
        };
        
        setProfileData(parsedData);
        
        // Update context dengan gambar profil yang dimuat
        if (parsedData.profileImage) {
          updateProfileImage(parsedData.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Hanya tampilkan pesan error jika memang terjadi kesalahan serius
      if (loading) {
        setMessage({ type: 'error', text: 'Gagal memuat data profil' });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkFaceData = async () => {
    try {
      const res = await fetch('/api/face/get-data');
      if (res.ok) {
        setFaceRegistered(true);
      } else {
        setFaceRegistered(false);
      }
    } catch {
      setFaceRegistered(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, fieldName) => {
    setProfileData(prev => ({
      ...prev,
      [fieldName]: date
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (!file) return;
    
    console.log('File upload triggered for:', name);
    
    if (name === 'profileImage') {
      // 1. Tampilkan preview lokal
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setProfileData(prev => ({
          ...prev,
          profileImage: imageDataUrl
        }));
        
        // 2. Upload ke server
        const formData = new FormData();
        formData.append('file', file);
        
        // Tampilkan status loading
        setMessage({ type: 'info', text: 'Mengupload foto...', details: '' });
        
        fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Foto berhasil diupload:', data.fileUrl);
            // Update profile data dengan URL file
            setProfileData(prev => ({
              ...prev,
              profileImage: data.fileUrl
            }));
            // Update context supaya navbar ikut diupdate
            updateProfileImage(data.fileUrl);
            setMessage({ type: 'success', text: 'Foto berhasil diupload', details: '' });
          } else {
            console.error('Error dari server:', data.message);
            setMessage({ 
              type: 'error', 
              text: 'Gagal mengupload foto', 
              details: data.message || 'Terjadi kesalahan saat mengupload foto'
            });
          }
          
          // Clear message after 3 seconds
          setTimeout(() => {
            setMessage({ type: '', text: '', details: '' });
          }, 3000);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
          setMessage({ 
            type: 'error', 
            text: 'Gagal mengupload foto', 
            details: error.message || 'Terjadi kesalahan saat mengupload foto'
          });
          
          // Clear error message after 3 seconds
          setTimeout(() => {
            setMessage({ type: '', text: '', details: '' });
          }, 3000);
        });
      };
      
      reader.readAsDataURL(file);
    } else if (name === 'applicationLetter') {
      // Handle application letter upload
      const formData = new FormData();
      formData.append('file', file);
      
      setMessage({ type: 'info', text: 'Mengupload surat...', details: '' });
      
      fetch('/api/upload/document', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProfileData(prev => ({
            ...prev,
            applicationLetter: data.fileUrl
          }));
          setMessage({ type: 'success', text: 'Surat berhasil diupload', details: '' });
          setTimeout(() => {
            setMessage({ type: '', text: '', details: '' });
          }, 2000);
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Gagal mengupload surat', 
            details: data.message || 'Terjadi kesalahan saat mengupload surat'
          });
          setTimeout(() => {
            setMessage({ type: '', text: '', details: '' });
          }, 3000);
        }
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        setMessage({ 
          type: 'error', 
          text: 'Gagal mengupload surat', 
          details: error.message || 'Terjadi kesalahan saat mengupload surat'
        });
        setTimeout(() => {
          setMessage({ type: '', text: '', details: '' });
        }, 3000);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '', details: '' });
    
    try {
      // Format dates for API
      const formattedData = {
        ...profileData,
        birthPlace: profileData.birthPlace || '',
        internshipStartDate: profileData.internshipStartDate instanceof Date 
          ? format(profileData.internshipStartDate, 'dd-MM-yyyy') 
          : profileData.internshipStartDate || ''
      };
      
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Profil berhasil diperbarui',
          details: data.message 
        });
        
        // Refresh data profil
        fetchUserProfile();
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Gagal memperbarui profil',
          details: data.message || 'Terjadi kesalahan saat memperbarui profil'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: 'Terjadi kesalahan',
        details: error.message || 'Terjadi kesalahan saat memperbarui profil'
      });
    } finally {
      setSaving(false);
      
      // Clear success message after 5 seconds
      if (message.type === 'success') {
        setTimeout(() => {
          setMessage({ type: '', text: '', details: '' });
        }, 5000);
      }
    }
  };

  const navigateToFaceRegistration = () => {
    // Navigate to face registration page with mode parameter
    router.push(`/dashboard/face-registration?mode=${faceRegistered ? 'update' : 'register'}`);
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="flex items-center justify-center h-screen pt-16">
          <div className="flex flex-col items-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="pt-24 pb-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar hanya ditampilkan pada tampilan mobile */}
          <div className="lg:hidden">
            <DashboardSidebar />
          </div>
          
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Update Identitas</h1>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
              
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 border border-green-300 text-green-800' 
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {message.type === 'success' ? (
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-bold">
                        {message.text}
                      </h3>
                      {message.details && (
                        <div className="mt-2 text-sm">
                          {message.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-base font-bold text-gray-800 dark:text-white mb-2">Foto Profil</label>
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                        {profileData.profileImage ? (
                          <img 
                            src={profileData.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 shadow transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input 
                          type="file" 
                          id="profileImage" 
                          name="profileImage"
                          className="hidden" 
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <button 
                        type="button"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition-colors"
                        onClick={() => document.getElementById('profileImage').click()}
                      >
                        Pilih Foto Baru
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg font-bold shadow transition-colors ${faceRegistered ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                        onClick={navigateToFaceRegistration}
                      >
                        {faceRegistered ? 'Update Wajah' : 'Daftar Wajah'}
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Maksimal 3MB (JPG, JPEG, PNG)</p>
                      <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">{faceRegistered ? 'Data wajah sudah terdaftar.' : 'Belum ada data wajah.'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama */}
                  <div>
                    <label htmlFor="name" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                  {/* TTL */}
                  <div>
                    <label htmlFor="birthPlace" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Tempat Tanggal Lahir</label>
                    <input
                      type="text"
                      id="birthPlace"
                      name="birthPlace"
                      value={profileData.birthPlace}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Contoh: Semarang, 23-04-2004"
                    />
                  </div>
                  {/* Alamat */}
                  <div>
                    <label htmlFor="address" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Alamat</label>
                    <textarea
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      rows="3"
                      placeholder="Masukkan alamat lengkap"
                    ></textarea>
                  </div>
                  {/* Universitas */}
                  <div>
                    <label htmlFor="university" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Universitas</label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      value={profileData.university}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Nama universitas"
                    />
                  </div>
                  {/* Fakultas */}
                  <div>
                    <label htmlFor="faculty" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Fakultas</label>
                    <input
                      type="text"
                      id="faculty"
                      name="faculty"
                      value={profileData.faculty}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Nama fakultas"
                    />
                  </div>
                  {/* Program Studi */}
                  <div>
                    <label htmlFor="studyProgram" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Program Studi</label>
                    <input
                      type="text"
                      id="studyProgram"
                      name="studyProgram"
                      value={profileData.studyProgram}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Nama program studi"
                    />
                  </div>
                  {/* Tanggal Mulai Magang */}
                  <div>
                    <label htmlFor="internshipStartDate" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Tanggal Mulai Magang</label>
                    <DatePicker
                      selected={profileData.internshipStartDate instanceof Date ? profileData.internshipStartDate : null}
                      onChange={(date) => handleDateChange(date, 'internshipStartDate')}
                      dateFormat="dd-MM-yyyy"
                      locale={id}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholderText="DD-MM-YYYY"
                    />
                  </div>
                  {/* Nomor HP */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-base font-bold text-gray-800 dark:text-white mb-2">Nomor HP</label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  {/* Surat Permohonan */}
                  <div>
                    <label className="block text-base font-bold text-gray-800 dark:text-white mb-2">Surat Permohonan</label>
                    <div className="flex flex-col space-y-2">
                      {profileData.applicationLetter ? (
                        <>
                          <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {profileData.applicationLetter.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a 
                              href={profileData.applicationLetter} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition-colors flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat Surat
                            </a>
                            <label 
                              htmlFor="applicationLetter" 
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold shadow cursor-pointer transition-colors flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Ubah Surat
                            </label>
                          </div>
                        </>
                      ) : (
                        <label 
                          htmlFor="applicationLetter" 
                          className="w-fit px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow cursor-pointer transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Surat
                        </label>
                      )}
                      <input 
                        type="file" 
                        id="applicationLetter" 
                        name="applicationLetter"
                        className="hidden" 
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: PDF, DOC, DOCX (Maks. 5MB)</p>
                    </div>
                  </div>
                </div>
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}