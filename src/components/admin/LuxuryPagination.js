'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LuxuryPagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  containerClassName = '',
  vertical = false, // Opsi untuk pagination vertikal
  maxDisplayedPages = 6 // Maksimal jumlah halaman yang ditampilkan
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (totalPages <= 1) return null;
  
  // Generate page numbers with limited display
  const getVisiblePages = () => {
    const pages = [];
    
    // Jika total halaman kurang dari maxDisplayedPages, tampilkan semua
    if (totalPages <= maxDisplayedPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Selalu tampilkan halaman pertama
    pages.push(1);
    
    // Tentukan awal dan akhir halaman yang ditampilkan
    let startPage = Math.max(2, currentPage - Math.floor((maxDisplayedPages - 2) / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxDisplayedPages - 3);
    
    // Jika endPage terlalu kecil, sesuaikan startPage
    if (endPage < startPage + maxDisplayedPages - 3) {
      startPage = Math.max(2, endPage - (maxDisplayedPages - 3));
    }
    
    // Tambahkan ellipsis jika diperlukan
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Tambahkan halaman di tengah
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Tambahkan ellipsis jika diperlukan
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Selalu tampilkan halaman terakhir
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  
  // Animasi untuk pagination
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center justify-center mt-6 mb-4 ${containerClassName}`}
      initial="hidden"
      animate={isMounted ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Previous Button */}
      <motion.button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        variants={itemVariants}
        whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
        whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
        className={`
          relative overflow-hidden group ${vertical ? 'mb-2' : 'mr-2'}
          px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/30'}
        `}
      >
        <span className="relative z-10 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Prev
        </span>
        {currentPage !== 1 && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </motion.button>
      
      {/* Page Numbers */}
      <div className={`flex ${vertical ? 'flex-col space-y-2' : 'flex-row space-x-2'} items-center`}>
        {visiblePages.map((page, index) => (
          page === '...' ? (
            <motion.div 
              key={`ellipsis-${index}`}
              variants={itemVariants}
              className={`w-10 h-10 flex items-center justify-center text-gray-500 font-medium ${vertical ? '' : ''}`}
            >
              ...
            </motion.div>
          ) : (
            <motion.button
              key={`page-${page}`}
              onClick={() => page !== currentPage && onPageChange(page)}
              variants={itemVariants}
              whileHover={page !== currentPage ? { scale: 1.1 } : {}}
              whileTap={page !== currentPage ? { scale: 0.9 } : {}}
              className={`
                w-10 h-10 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
                ${currentPage === page 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-110' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600'}
              `}
            >
              {page}
            </motion.button>
          )
        ))}
      </div>
      
      {/* Next Button */}
      <motion.button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        variants={itemVariants}
        whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
        whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
        className={`
          relative overflow-hidden group ${vertical ? 'mt-2' : 'ml-2'}
          px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/30'}
        `}
      >
        <span className="relative z-10 flex items-center">
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </span>
        {currentPage !== totalPages && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </motion.button>
    </motion.div>
  );
} 