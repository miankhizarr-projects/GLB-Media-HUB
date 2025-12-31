import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const pageLimit = 5; // Number of page links to show
    const halfLimit = Math.floor(pageLimit / 2);

    if (totalPages <= pageLimit + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > halfLimit + 2) {
        pages.push('...');
      }

      let start = Math.max(2, currentPage - halfLimit);
      let end = Math.min(totalPages - 1, currentPage + halfLimit);

      if (currentPage <= halfLimit + 1) {
        end = pageLimit;
      }
      if (currentPage >= totalPages - halfLimit) {
        start = totalPages - pageLimit + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - halfLimit - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  const buttonClass = "flex items-center justify-center h-10 px-4 font-medium text-brand-text bg-brand-surface rounded-lg transition-colors";
  const activeClass = "bg-brand-primary text-white hover:bg-brand-primary";
  const inactiveClass = "hover:bg-brand-bg-light";
  const disabledClass = "opacity-50 cursor-not-allowed";

  return (
    <nav className="flex justify-center items-center space-x-2 sm:space-x-4 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${buttonClass} ${inactiveClass} ${currentPage === 1 ? disabledClass : ''}`}
        aria-label="Previous page"
      >
        <i className="ri-arrow-left-s-line text-xl"></i>
      </button>

      <div className="hidden sm:flex items-center space-x-2">
        {pageNumbers.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`${buttonClass} ${currentPage === page ? activeClass : inactiveClass}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="flex items-center justify-center h-10 px-2 text-brand-text-secondary">
              {page}
            </span>
          )
        )}
      </div>
      <div className="sm:hidden flex items-center text-sm font-medium text-brand-text-secondary">
            Page {currentPage} of {totalPages}
      </div>


      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${buttonClass} ${inactiveClass} ${currentPage === totalPages ? disabledClass : ''}`}
        aria-label="Next page"
      >
        <i className="ri-arrow-right-s-line text-xl"></i>
      </button>
    </nav>
  );
};

export default Pagination;