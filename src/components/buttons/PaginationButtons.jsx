import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react'

const PaginationButtons = ({handlePageChange, currentPage, totalPages}) => {
  return (
    <div className="flex justify-center mt-4 space-x-3">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 border rounded-lg shadow-lg ${
          currentPage === 1 ? "text-gray-400" : "text-black hover:bg-gray-200"
        }`}
      >
        <ChevronLeft />
      </button>
      <span className="px-4 py-2 border rounded-lg bg-gray-100  text-gray-500">
        <span className="text-black">{currentPage}</span> / {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 border rounded-lg shadow-lg ${
          currentPage === totalPages
            ? "text-gray-400"
            : "text-black hover:bg-gray-200"
        }`}
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default PaginationButtons
