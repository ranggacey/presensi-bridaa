'use client';

import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AttendanceCard({ attendance, onViewDetails }) {
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

  // Calculate internship duration in days
  const calculateDuration = (startDate) => {
    if (!startDate) return null;
    try {
      const start = parseISO(startDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays;
    } catch (error) {
      return null;
    }
  };

  const internshipDays = attendance.user?.internshipStartDate 
    ? calculateDuration(attendance.user.internshipStartDate)
    : null;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
              {attendance.user?.profileImage ? (
                <Image
                  src={attendance.user.profileImage}
                  alt={attendance.user?.name || attendance.username}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {attendance.user?.name || attendance.username}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {attendance.user?.university || 'Unknown University'}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(attendance.status)}`}
            >
              {getStatusText(attendance.status)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="text-xs text-gray-500">Tanggal:</div>
            <div className="text-xs font-medium text-gray-700 text-right">{formatDate(attendance.date)}</div>
            
            <div className="text-xs text-gray-500">Waktu Masuk:</div>
            <div className="text-xs font-medium text-gray-700 text-right">{formatTime(attendance.date)}</div>
            
            {internshipDays && (
              <>
                <div className="text-xs text-gray-500">Durasi Magang:</div>
                <div className="text-xs font-medium text-gray-700 text-right">{internshipDays} hari</div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-2">
          <button
            onClick={() => onViewDetails(attendance)}
            className="w-full py-2 px-4 bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors rounded-md text-sm font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Lihat Detail
          </button>
        </div>
      </div>
    </motion.div>
  );
} 