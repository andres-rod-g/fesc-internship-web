import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginacionPracticantes({
  pagination,
  currentPage,
  onPageChange
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push("...");
      }
      pages.push(pagination.totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-lg border border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{pagination.total}</span> practicantes
        (Página <span className="font-semibold">{currentPage}</span> de{" "}
        <span className="font-semibold">{pagination.totalPages}</span>)
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) => (
          <React.Fragment key={idx}>
            {page === "..." ? (
              <span className="px-2 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                disabled={page === currentPage}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-accent text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
