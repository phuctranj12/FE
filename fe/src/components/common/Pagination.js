import React from 'react';

/*
  Reusable Pagination component
  Props:
  - currentPage: number (1-based)
  - totalPages: number
  - onChange: (page: number) => void
  - windowSize?: number (default 5)  // how many page numbers to show
*/
export default function Pagination({ currentPage = 1, totalPages = 1, onChange, windowSize = 5 }) {
    const handleChange = (page) => {
        if (!onChange) return;
        const p = Math.max(1, Math.min(totalPages, page));
        if (p !== currentPage) onChange(p);
    };

    const pages = [];
    const size = Math.max(1, windowSize);
    if (totalPages <= size) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= Math.ceil(size / 2)) {
        for (let i = 1; i <= size; i++) pages.push(i);
    } else if (currentPage >= totalPages - Math.floor(size / 2)) {
        for (let i = totalPages - size + 1; i <= totalPages; i++) pages.push(i);
    } else {
        const start = currentPage - Math.floor(size / 2);
        for (let i = 0; i < size; i++) pages.push(start + i);
    }

    return (
        <div className="pagination">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => handleChange(1)}>««</button>
            <button className="page-btn" disabled={currentPage === 1} onClick={() => handleChange(currentPage - 1)}>«</button>
            {pages.map((p) => (
                <button key={p} className={`page-btn ${currentPage === p ? 'active' : ''}`} onClick={() => handleChange(p)}>
                    {p}
                </button>
            ))}
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handleChange(currentPage + 1)}>»</button>
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handleChange(totalPages)}>»»</button>
        </div>
    );
}


