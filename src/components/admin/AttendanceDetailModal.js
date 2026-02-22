'use client';

import { format, parseISO, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AttendanceDetailModal({ attendance, onClose, onExportExcel }) {
  if (!attendance) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on-time':
        return 'Tepat Waktu';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return status;
    }
  };

  const calculateInternshipDuration = () => {
    if (!attendance.user?.internshipStartDate) return null;
    
    try {
      const startDate = parseISO(attendance.user.internshipStartDate);
      const today = new Date();
      return differenceInDays(today, startDate);
    } catch (error) {
      return null;
    }
  };

  const internshipDuration = calculateInternshipDuration();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Detail Presensi</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* User Information */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                {attendance.user?.profileImage ? (
                  <Image
                    src={attendance.user.profileImage}
                    alt={attendance.user?.name || attendance.username}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">
                {attendance.user?.name || attendance.username}
              </h4>
              <p className="text-sm text-gray-600">
                {attendance.user?.university || 'Unknown University'}
                {attendance.user?.faculty ? `, ${attendance.user.faculty}` : ''}
              </p>
              <p className="text-sm text-gray-600">
                {attendance.user?.studyProgram || ''}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(attendance.status)}`}
                >
                  {getStatusText(attendance.status)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Attendance Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-base font-medium text-gray-800 mb-3">Informasi Presensi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal Presensi</p>
                <p className="text-base font-medium text-gray-800">{formatDate(attendance.date)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Waktu Masuk</p>
                <p className="text-base font-medium text-gray-800">{formatTime(attendance.date)}</p>
              </div>
              
              {internshipDuration !== null && (
                <div>
                  <p className="text-sm text-gray-500">Durasi Magang</p>
                  <p className="text-base font-medium text-gray-800">{internshipDuration} hari</p>
                </div>
              )}
              
              {attendance.user?.internshipStartDate && (
                <div>
                  <p className="text-sm text-gray-500">Mulai Magang</p>
                  <p className="text-base font-medium text-gray-800">{formatDate(attendance.user.internshipStartDate)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Face Recognition Info (if available) */}
          {attendance.faceConfidence && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-base font-medium text-gray-800 mb-3">Informasi Pengenalan Wajah</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Confidence Score</p>
                  <p className="text-base font-medium text-gray-800">{(attendance.faceConfidence * 100).toFixed(2)}%</p>
                </div>
                
                {attendance.faceMatchTime && (
                  <div>
                    <p className="text-sm text-gray-500">Waktu Pengenalan</p>
                    <p className="text-base font-medium text-gray-800">{formatTime(attendance.faceMatchTime)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          {attendance.user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-base font-medium text-gray-800 mb-3">Informasi Kontak</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attendance.user.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Nomor HP</p>
                    <p className="text-base font-medium text-gray-800">{attendance.user.phoneNumber}</p>
                  </div>
                )}
                
                {attendance.user.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-800">{attendance.user.email}</p>
                  </div>
                )}
                
                {attendance.user.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="text-base font-medium text-gray-800">{attendance.user.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => onExportExcel(attendance._id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export ke Excel
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 