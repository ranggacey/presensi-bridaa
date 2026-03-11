'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';

export default function AttendanceDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [attendance, setAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!id) return;
    
    const fetchAttendanceDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/attendance/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance details');
        }
        
        const data = await response.json();
        setAttendance(data.attendance);
      } catch (err) {
        console.error('Error fetching attendance details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceDetail();
  }, [id]);

  useEffect(() => {
    if (!attendance || !attendance.user) return;
    
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true);
        const userId = attendance.user._id;
        const response = await fetch(`/api/admin/attendance/history?userId=${userId}&page=${currentPage}&limit=${itemsPerPage}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance history');
        }
        
        const data = await response.json();
        setAttendanceHistory(data.attendances);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } catch (err) {
        console.error('Error fetching attendance history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceHistory();
  }, [attendance, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Belum Diatur';
    
    try {
      // If it's already a Date object or valid ISO string, use it directly
      const date = new Date(dateString);
      
      // Handle invalid date
      if (isNaN(date.getTime())) {
        // Try to parse other formats
        if (typeof dateString === 'string') {
          // Try DD-MM-YYYY format
          const parts = dateString.split(/[-\/]/);
          if (parts.length === 3) {
            // Try both DD-MM-YYYY and YYYY-MM-DD interpretations
            const potentialDates = [
              new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])), // DD-MM-YYYY
              new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))  // YYYY-MM-DD
            ];
            
            // Use the first valid date
            for (const potentialDate of potentialDates) {
              if (!isNaN(potentialDate.getTime())) {
                return potentialDate.toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              }
            }
          }
        }
        
        return 'Format Tanggal Tidak Valid';
      }
      
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error Format Tanggal';
    }
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate internship duration
  const calculateInternshipDuration = (startDate) => {
    if (!startDate) return 'Belum Diatur';
    
    try {
      // First, try to parse the date directly
      let start = new Date(startDate);
      
      // Handle invalid date by trying alternative formats
      if (isNaN(start.getTime()) && typeof startDate === 'string') {
        // Try to parse DD-MM-YYYY format
        const parts = startDate.split(/[-\/]/);
        if (parts.length === 3) {
          // Try both DD-MM-YYYY and YYYY-MM-DD interpretations
          const potentialDates = [
            new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])), // DD-MM-YYYY
            new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))  // YYYY-MM-DD
          ];
          
          // Use the first valid date
          for (const potentialDate of potentialDates) {
            if (!isNaN(potentialDate.getTime())) {
              start = potentialDate;
              break;
            }
          }
        }
      }
      
      // If still invalid after trying alternative formats
      if (isNaN(start.getTime())) {
        return 'Format Tanggal Tidak Valid';
      }
      
      const current = new Date();
      
      // Calculate difference in days
      const diffTime = Math.abs(current - start);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Convert to months and days format
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      
      // Format the output
      if (months > 0 && days > 0) {
        return `${months} bulan ${days} hari`;
      } else if (months > 0) {
        return `${months} bulan`;
      } else {
        return `${days} hari`;
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Error Perhitungan';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'on-time': 'Tepat Waktu',
      'late': 'Terlambat',
      'absent': 'Tidak Hadir'
    };
    return statusMap[status] || status;
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

  const exportToExcel = async () => {
    try {
      const response = await fetch(`/api/admin/export-attendance?attendanceId=${id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${id}.xlsx`;
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading && !attendance) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading attendance details</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Link href="/admin/attendance" className="text-sm font-medium text-red-600 hover:text-red-500">
                Back to Attendance List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Attendance record not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The attendance record you&apos;re looking for could not be found.</p>
            </div>
            <div className="mt-4">
              <Link href="/admin/attendance" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                Back to Attendance List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = attendance.user || {};
  const internshipDuration = user.internshipStartDate 
    ? calculateInternshipDuration(user.internshipStartDate) 
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Detail Presensi</h1>
        </div>
        <button
          onClick={exportToExcel}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export ke Excel
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            {user.profileImage ? (
              <Image src={user.profileImage} alt={user.name || 'User'} width={56} height={56} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{user.name || 'N/A'}</h2>
            <p className="text-xs text-gray-500 truncate">{user.email || 'N/A'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Universitas', value: user.university },
            { label: 'Fakultas', value: user.faculty },
            { label: 'Program Studi', value: user.studyProgram },
            { label: 'Tanggal Masuk', value: user.internshipStartDate ? formatDate(user.internshipStartDate) : null },
            { label: 'Durasi Magang', value: internshipDuration },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Riwayat Presensi</h2>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
          {loading && attendanceHistory.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-400">Tidak ada riwayat presensi</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="sm:hidden divide-y divide-gray-100">
                {attendanceHistory.map((record, index) => (
                  <div key={record._id || index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">{formatDate(record.date)}</p>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusBadgeClass(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <div>
                        <span className="text-gray-400">Masuk: </span>
                        <span className="font-medium text-gray-700">{formatTime(record.checkInTime)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Pulang: </span>
                        <span className="font-medium text-gray-700">{formatTime(record.checkOutTime)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Masuk</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pulang</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(record.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(record.checkInTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(record.checkOutTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      Halaman {currentPage} dari {totalPages}
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-gray-600 hover:bg-white"
                        >
                          Sebelumnya
                        </button>
                        <div className="flex gap-1">
                          {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = index + 1;
                            } else if (currentPage <= 3) {
                              pageNum = index + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + index;
                            } else {
                              pageNum = currentPage - 2 + index;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-white border border-gray-300'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-gray-600 hover:bg-white"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate lateness
function calculateLateness(checkInTime, date) {
  if (!checkInTime || !date) return 'N/A';
  
  const checkIn = new Date(checkInTime);
  const targetDate = new Date(date);
  
  // Set the target time to 8:30 AM
  targetDate.setHours(8, 30, 0, 0);
  
  // If check-in is before target time, they're not late
  if (checkIn <= targetDate) return 'Tidak terlambat';
  
  // Calculate the difference
  const diffMs = checkIn - targetDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  // Format the lateness
  if (hours > 0) {
    return `${hours} jam ${minutes} menit ${seconds} detik`;
  } else if (minutes > 0) {
    return `${minutes} menit ${seconds} detik`;
  } else {
    return `${seconds} detik`;
  }
} 