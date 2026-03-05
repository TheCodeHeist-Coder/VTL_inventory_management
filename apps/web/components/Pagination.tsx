'use client';

import type { PaginationProps } from '../../web/types';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemName = 'items' }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
        return pages;
    };

    const paginationStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: '16px 0', marginTop: '16px', borderTop: '1px solid rgba(148,163,184,0.1)'
    };
    const btnBase: React.CSSProperties = {
        padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)',
        background: 'rgba(10,21,19,4.5)', color: '#ffffff', cursor: 'pointer', fontSize: '13px',
        transition: 'all 0.2s', fontWeight: 500
    };
    const btnActive: React.CSSProperties = { ...btnBase,background:'#ffff', color: '#000000', border: '1px solid #6366f1', fontWeight: 600 };
    const btnDisabled: React.CSSProperties = { ...btnBase, opacity: 0.4, cursor: 'not-allowed' };

    return (
        <div style={paginationStyle}>
            <button style={currentPage === 1 ? btnDisabled : btnBase} onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} disabled={currentPage === 1}>← Prev</button>
            {getPageNumbers().map((p, i) => p === '...' ? <span key={`dots-${i}`} style={{ color: '#64748b', fontSize: '13px' }}>…</span> : (
                <button key={p} style={p === currentPage ? btnActive : btnBase} onClick={() => onPageChange(p as number)}>{p}</button>
            ))}
            <button className='' style={currentPage === totalPages ? btnDisabled : btnBase} onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
            <span className='font-semibold ml-5 border border-gray-400 rounded-full py-1 px-4'>{totalItems} {itemName}</span>
        </div>
    );
}
