'use client';

interface StatusBadgeProps {
    status: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    MODIFIED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    APPROVED_BY_BM: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    APPROVED_BY_DH: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    FULFILLED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    RECEIVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const style = statusStyles[status] || { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200' };
    const label = status.replace(/_/g, ' ');

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
            {label}
        </span>
    );
}
