'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import LuxuryPagination from '@/components/admin/LuxuryPagination';
import { useRouter } from 'next/navigation';

export default function IdentitiesManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    search: '',
    university: ''
  });
  const [universities, setUniversities] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    // Reset ke halaman pertama saat filter berubah
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers();
    }
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Buat query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      if (filter.search) params.append('search', filter.search);
      if (filter.university) params.append('university', filter.university);
      
      const response = await fetch(`/api/admin/identities?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        
        // Ekstrak universitas unik untuk dropdown filter
        if (!filter.university) {
          const uniqueUniversities = [...new Set(data.allUsers.map(user => user.university).filter(Boolean))];
          setUniversities(uniqueUniversities);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilter = () => {
    setFilter({
      search: '',
      university: ''
    });
  };

  const openDetailPage = (userId) => {
    router.push(`/admin/identities/${userId}`);
  };

  const exportToExcel = async (userId = null) => {
    try {
      const endpoint = userId 
        ? `/api/admin/export-identity?userId=${userId}` 
        : '/api/admin/export-identities';
      
      // Add filters to export all if exporting all
      if (!userId) {
        if (filter.search) endpoint += `&search=${filter.search}`;
        if (filter.university) endpoint += `&university=${filter.university}`;
      }
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = userId 
          ? `identitas-${users.find(u => u._id === userId)?.name || 'pengguna'}.xlsx` 
          : 'semua-identitas.xlsx';
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

  // Update the function to use LuxuryPagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Identitas Peserta Magang</h1>
        <motion.button
          onClick={() => exportToExcel()}
          className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Semua
        </motion.button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">Pencarian</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Cari nama atau universitas..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="university" className="block text-xs font-medium text-gray-500 mb-1">Universitas</label>
            <select
              id="university"
              name="university"
              value={filter.university}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Semua Universitas</option>
              {universities.map((univ, index) => (
                <option key={index} value={univ}>{univ}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              Filter
            </button>
            {(filter.search || filter.university) && (
              <button
                type="button"
                onClick={resetFilter}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors text-sm font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* User Cards with Pagination */}
      <div>
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 text-sm">Tidak ada data identitas yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {users.map((user) => (
              <motion.div
                key={user._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => openDetailPage(user._id)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      {user.profileImage ? (
                        <Image src={user.profileImage} alt={user.name} width={48} height={48} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-bold text-gray-900 truncate">{user.name}</h2>
                      <p className="text-xs text-gray-500 truncate">{user.university || 'Belum diisi'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.faculty || 'Belum diisi'}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetailPage(user._id); }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium text-center"
                    >
                      Lihat Detail
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); exportToExcel(user._id); }}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium text-center"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {users.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Menampilkan {users.length} dari {totalPages * itemsPerPage > users.length ? totalPages * itemsPerPage : users.length} data
            </p>
            {totalPages > 1 && (
              <LuxuryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 