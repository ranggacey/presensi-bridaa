'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/admin/Pagination';
import Link from 'next/link';



export default function AttendancePage() {
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
    // Reset to page 1 when filter changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAttendances();
    }
  }, [filter]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.username) params.append('username', filter.username);
      if (filter.status) params.append('status', filter.status);
      
      try {
        const response = await fetch(`/api/admin/attendance?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setAttendances(data.attendances || []);
          setTotalPages(Math.max(1, Math.ceil(data.total / itemsPerPage)));
          
          // Calculate statistics
          setStats({
            total: data.total || 0,
            onTime: data.stats?.onTime || 0,
            late: data.stats?.late || 0,
            absent: data.stats?.absent || 0
          });
          
          // Reset to page 1 if current page is higher than total pages
          if (currentPage > Math.max(1, Math.ceil(data.total / itemsPerPage))) {
            setCurrentPage(1);
          }
        } else {
          throw new Error('API response was not ok');
        }
      } catch (apiError) {
        console.error('API error, using mock data instead:', apiError);
        
        // If the API fails, use mock data for testing
        let filteredMockData = [...mockAttendances];
        
        // Apply search filter to mock data
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredMockData = filteredMockData.filter(item => 
            (item.user?.name && item.user.name.toLowerCase().includes(search)) || 
            (item.user?.email && item.user.email.toLowerCase().includes(search))
          );
        }
        
        // Apply status filter
        if (filter.status) {
          filteredMockData = filteredMockData.filter(item => item.status === filter.status);
        }
        
        // Set mock data
        setAttendances(filteredMockData);
        setTotalPages(Math.ceil(filteredMockData.length / itemsPerPage));
        
        // Set mock statistics
        setStats({
          total: mockAttendances.length,
          onTime: mockAttendances.filter(a => a.status === 'on-time').length,
          late: mockAttendances.filter(a => a.status === 'late').length,
          absent: mockAttendances.filter(a => a.status === 'absent').length
        });
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
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
      alert('Gagal mengekspor data ke Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">Data Presensi</h1>
            <p className="text-gray-600 mt-1">Kelola dan pantau data presensi magang</p>
          </div>
          <button
            onClick={() => exportToExcel()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            Export ke Excel
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 border-gray-300 rounded-md shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={resetFilter}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-r-md border-l border-gray-300 h-full flex items-center"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Table Layout */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-16">
                  No
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                    </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="mt-2 text-gray-500">Tidak ada data presensi yang ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendances.map((attendance, index) => (
                  <tr key={attendance._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {attendance.user?.profileImage ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={attendance.user.profileImage} 
                              alt={attendance.user.name} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {attendance.user?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {attendance.user?.name || '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.user?.university || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{attendance.user?.email || '-'}</div>
                      <div className="text-sm text-gray-500">
                        {attendance.user?.studyProgram && attendance.user?.faculty 
                          ? `${attendance.user.studyProgram}, ${attendance.user.faculty}`
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => exportToExcel(attendance._id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Excel
                        </button>
                        <Link
                          href={`/admin/attendance/${attendance._id}`}
                          className="text-green-600 hover:text-green-800 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stats & Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 bg-white rounded-md shadow-sm">
                <span className="text-xs text-gray-500 block">Total</span>
                <span className="text-lg font-semibold">{stats.total}</span>
              </div>
              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-md shadow-sm">
                <span className="text-xs text-green-500 block">Tepat Waktu</span>
                <span className="text-lg font-semibold">{stats.onTime}</span>
              </div>
              <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md shadow-sm">
                <span className="text-xs text-yellow-500 block">Terlambat</span>
                <span className="text-lg font-semibold">{stats.late}</span>
              </div>
              <div className="px-4 py-2 bg-red-50 text-red-700 rounded-md shadow-sm">
                <span className="text-xs text-red-500 block">Tidak Hadir</span>
                <span className="text-lg font-semibold">{stats.absent}</span>
              </div>
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}