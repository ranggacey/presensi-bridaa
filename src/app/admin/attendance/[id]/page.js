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
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Detail Presensi</h1>
        </div>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export ke Excel
        </button>
      </div>

      {/* User info header */}
      <div className="bg-white shadow rounded-lg overflow-hidden p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.name || 'User'}
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
          
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name || 'N/A'}</h2>
            <p className="text-sm text-gray-500">{user.university || 'N/A'}</p>
            <p className="text-sm text-gray-500">{user.faculty || 'N/A'} - {user.studyProgram || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Attendance Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Nama
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.name || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Email
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Universitas
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.university || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fakultas
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.faculty || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Program Studi
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.studyProgram || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Tanggal Masuk Magang
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.internshipStartDate ? formatDate(user.internshipStartDate) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Durasi Magang
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {internshipDuration || 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Presensi</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading && attendanceHistory.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Nama
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Presensi Masuk
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Presensi Pulang
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada riwayat presensi
                        </td>
                      </tr>
                    ) : (
                      attendanceHistory.map((record, index) => (
                        <tr key={record._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTime(record.checkInTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'on-time' ? 'bg-green-100 text-green-800' : 
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTime(record.checkOutTime)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {attendanceHistory.length > 0 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>
                  
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, attendanceHistory.length)}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, attendanceHistory.length)}</span> dari <span className="font-medium">{totalPages * itemsPerPage}</span> hasil
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                            currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                              currentPage === index + 1 ? 'bg-blue-50 text-blue-600 z-10' : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                            currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
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