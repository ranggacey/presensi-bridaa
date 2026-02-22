'use client';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  
  // Calculate which page numbers to show
  const getPageRange = () => {
    const delta = 1; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }
    
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  };
  
  const pageNumbers = getPageRange();
  
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex rounded-md shadow-sm mx-2" role="group">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`
            px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md
            ${currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
          `}
        >
          Previous
        </button>
        
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span 
              key={`dots-${index}`} 
              className="px-4 py-2 text-sm font-medium border-t border-b border-gray-300 bg-white text-gray-700"
            >
              {page}
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[40px] px-4 py-2 text-sm font-medium border-t border-b border-gray-300
                ${currentPage === page 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                ${index === pageNumbers.length - 1 && page !== totalPages ? 'border-r' : ''}
              `}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`
            px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md
            ${currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
} 