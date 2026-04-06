'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/admin/Pagination';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';



export default function AttendancePage() {
  const { toast } = useToast();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    username: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    late: 0,
    absent: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAttendances();
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAttendances();
    }
  }, [filter, searchTerm]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      if (searchTerm) params.append('username', searchTerm);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.status) params.append('status', filter.status);
      
      const response = await fetch(`/api/admin/attendance?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setAttendances(data.attendances || []);
        setTotalPages(Math.max(1, Math.ceil(data.total / itemsPerPage)));
        setStats({
          total: data.total || 0,
          onTime: data.stats?.onTime || 0,
          late: data.stats?.late || 0,
          absent: data.stats?.absent || 0
        });
        
        if (currentPage > Math.max(1, Math.ceil(data.total / itemsPerPage))) {
          setCurrentPage(1);
        }
      } else {
        console.error('API response was not ok');
        setAttendances([]);
        setTotalPages(1);
        setStats({ total: 0, onTime: 0, late: 0, absent: 0 });
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
      setAttendances([]);
      setTotalPages(1);
      setStats({ total: 0, onTime: 0, late: 0, absent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilter = (e) => {
    e.preventDefault();
    fetchAttendances();
  };

  const resetFilter = () => {
    setFilter({
      startDate: '',
      endDate: '',
      username: '',
      status: ''
    });
    setSearchTerm('');
  };

  const openDetailModal = (attendance) => {
    setCurrentAttendance(attendance);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setCurrentAttendance(null);
  };

  const exportToExcel = async (attendanceId = null) => {
    try {
      const endpoint = attendanceId 
        ? `/api/admin/export-attendance?attendanceId=${attendanceId}` 
        : '/api/admin/export-attendances';
      
      // Add filters to export if exporting all
      if (!attendanceId) {
        const params = new URLSearchParams();
        if (filter.startDate) params.append('startDate', filter.startDate);
        if (filter.endDate) params.append('endDate', filter.endDate);
        if (filter.username) params.append('username', filter.username);
        if (filter.status) params.append('status', filter.status);
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
      }
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = attendanceId 
          ? `attendance-${attendanceId}.xlsx` 
          : 'attendance-data.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Gagal mengekspor data ke Excel');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Data Presensi Pengguna</h1>
            <p className="text-sm text-gray-600 mt-0.5">Lihat daftar pengguna dengan statistik presensi masing-masing</p>
          </div>
          <button
            onClick={() => exportToExcel()}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export ke Excel
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama, username, atau email pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {(searchTerm || filter.startDate || filter.endDate || filter.status) && (
            <button
              onClick={resetFilter}
              className="px-3 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 text-sm font-medium flex-shrink-0 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white px-3 py-2.5 rounded-lg shadow-sm text-center">
          <span className="text-[10px] sm:text-xs text-gray-500 block">Total</span>
          <span className="text-base sm:text-lg font-bold text-gray-800">{stats.total}</span>
        </div>
        <div className="bg-green-50 px-3 py-2.5 rounded-lg shadow-sm text-center">
          <span className="text-[10px] sm:text-xs text-green-600 block">Tepat Waktu</span>
          <span className="text-base sm:text-lg font-bold text-green-700">{stats.onTime}</span>
        </div>
        <div className="bg-yellow-50 px-3 py-2.5 rounded-lg shadow-sm text-center">
          <span className="text-[10px] sm:text-xs text-yellow-600 block">Terlambat</span>
          <span className="text-base sm:text-lg font-bold text-yellow-700">{stats.late}</span>
        </div>
        <div className="bg-red-50 px-3 py-2.5 rounded-lg shadow-sm text-center">
          <span className="text-[10px] sm:text-xs text-red-600 block">Tidak Hadir</span>
          <span className="text-base sm:text-lg font-bold text-red-700">{stats.absent}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="mt-2 text-gray-500 text-sm">Tidak ada pengguna yang ditemukan</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="sm:hidden divide-y divide-gray-100">
              {attendances.map((userAttendance, index) => (
                <div key={userAttendance._id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {userAttendance.user?.profileImage ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={userAttendance.user.profileImage} alt={userAttendance.user?.name} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 font-semibold text-sm">{userAttendance.user?.name?.charAt(0) || '?'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userAttendance.user?.name || '-'}</p>
                      <p className="text-xs text-gray-500 truncate">{userAttendance.user?.email || '-'}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">#{(currentPage - 1) * itemsPerPage + index + 1}</span>
                  </div>
                  
                  {/* User Info */}
                  {userAttendance.user?.university && (
                    <p className="text-xs text-gray-400 mb-2">{userAttendance.user.university}{userAttendance.user?.studyProgram ? ` · ${userAttendance.user.studyProgram}` : ''}</p>
                  )}
                  
                  {/* Attendance Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <span className="block text-xs text-gray-500">Total</span>
                      <span className="text-sm font-semibold text-gray-800">{userAttendance.stats?.total || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-green-600">Tepat</span>
                      <span className="text-sm font-semibold text-green-700">{userAttendance.stats?.present || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-yellow-600">Terlambat</span>
                      <span className="text-sm font-semibold text-yellow-700">{userAttendance.stats?.late || 0}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs text-red-600">Tidak Hadir</span>
                      <span className="text-sm font-semibold text-red-700">{userAttendance.stats?.absent || 0}</span>
                    </div>
                  </div>
                  
                  {/* Latest Attendance */}
                  {userAttendance.latestAttendance && (
                    <div className="text-xs text-gray-500 mb-3">
                      Presensi terakhir: {new Date(userAttendance.latestAttendance.date).toLocaleDateString('id-ID')} 
                      {userAttendance.latestAttendance.status === 'present' && ' - Tepat Waktu'}
                      {userAttendance.latestAttendance.status === 'late' && ' - Terlambat'}
                      {userAttendance.latestAttendance.status === 'absent' && ' - Tidak Hadir'}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/attendance/${userAttendance._id}`}
                      className="flex-1 text-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      Lihat Riwayat
                    </Link>
                    <button
                      onClick={() => exportToExcel(userAttendance._id)}
                      className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      Export Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-16">No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Pengguna</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Statistik Presensi</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Presensi Terakhir</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((userAttendance, index) => (
                    <tr key={userAttendance._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {userAttendance.user?.profileImage ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={userAttendance.user.profileImage} alt={userAttendance.user.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">{userAttendance.user?.name?.charAt(0) || '?'}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userAttendance.user?.name || '-'}</div>
                            <div className="text-sm text-gray-500">{userAttendance.user?.email || '-'}</div>
                            <div className="text-xs text-gray-400">
                              {userAttendance.user?.university || '-'}
                              {userAttendance.user?.studyProgram && ` · ${userAttendance.user.studyProgram}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{userAttendance.stats?.total || 0}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{userAttendance.stats?.present || 0}</div>
                            <div className="text-xs text-green-600">Tepat Waktu</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">{userAttendance.stats?.late || 0}</div>
                            <div className="text-xs text-yellow-600">Terlambat</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">{userAttendance.stats?.absent || 0}</div>
                            <div className="text-xs text-red-600">Tidak Hadir</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {userAttendance.latestAttendance ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(userAttendance.latestAttendance.date).toLocaleDateString('id-ID')}
                            </div>
                            <div className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userAttendance.latestAttendance.status === 'present' 
                                  ? 'bg-green-100 text-green-800' 
                                  : userAttendance.latestAttendance.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {userAttendance.latestAttendance.status === 'present' ? 'Tepat Waktu' : 
                                 userAttendance.latestAttendance.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                              </span>
                            </div>
                            {userAttendance.latestAttendance.checkInTime && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(userAttendance.latestAttendance.checkInTime).toLocaleTimeString('id-ID', { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Belum presensi</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => exportToExcel(userAttendance._id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            title="Export data presensi user ini"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Excel
                          </button>
                          <Link
                            href={`/admin/attendance/${userAttendance._id}`}
                            className="text-green-600 hover:text-green-800 transition-colors flex items-center"
                            title="Lihat riwayat presensi lengkap"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Riwayat
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && attendances.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, stats.total)} dari {stats.total} pengguna
              </p>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}