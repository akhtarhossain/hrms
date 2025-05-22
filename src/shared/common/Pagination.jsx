import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const next = () => {
    if (currentPage === totalPages) return;
    onPageChange(currentPage + 1);
  };

  const prev = () => {
    if (currentPage === 1) return;
    onPageChange(currentPage - 1);
  };

  // Generate page numbers with limits
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-3">
      {/* Previous Button */}
      <button
        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-[#A294F9] text-[#A294F9] hover:bg-[#A294F9] hover:text-white disabled:opacity-50 cursor-pointer"
        onClick={prev}
        disabled={currentPage === 1}
      >
        <FaArrowLeft className="h-3 w-3" /> Previous
      </button>

      {/* Page Buttons */}
      <div className="flex items-center gap-2">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 cursor-pointer
              ${
                currentPage === page
                  ? "bg-[#A294F9] text-white"
                  : "border border-[#A294F9] text-[#A294F9] hover:bg-[#A294F9] hover:text-white"
              }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-[#A294F9] text-[#A294F9] hover:bg-[#A294F9] hover:text-white disabled:opacity-50 cursor-pointer"
        onClick={next}
        disabled={currentPage === totalPages}
      >
        Next <FaArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}