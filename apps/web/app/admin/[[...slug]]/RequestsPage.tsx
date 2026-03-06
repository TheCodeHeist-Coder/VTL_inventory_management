'use client';

import { useState, useEffect } from 'react';
import Pagination from '../../../components/Pagination';
import StatusBadge from '../../../components/StatusBedge';
import api from '../../../api';

const PAGE_SIZE = 10;

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { api.get('/admin/requests?limit=200').then(r => { setRequests(r.data.data || r.data); setLoading(false); }); }, []);

     if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
    const filtered = filterStatus ? requests.filter(r => r.status === filterStatus) : requests;
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const statuses = Array.from(new Set(requests.map(r => r.status)));

    return (
        <>
            <div className="mb-8"><h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1">All Material Requests</h1><p>View all material requests across the system</p></div>

            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6"><div className="p-6" style={{ padding: '16px 24px' }}><div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>🔍 Filter:</span>
                <div style={{ minWidth: '200px' }}><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer appearance-none" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All Statuses</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                {filterStatus && <button className="px-3 py-1.5 border border-gray-400 text-brand-600 rounded-md text-xs" onClick={() => { setFilterStatus(''); setCurrentPage(1); }}>✕ Clear</button>}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>{filtered.length} requests</span>
            </div></div></div>

            <div className="bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6"><div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-brand-200"><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">State</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Engineer</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Phone</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Site</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Block</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">District</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Status</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Items</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Date</th></tr></thead>
                        <tbody>{paged.length > 0 ? paged.map(r => (
                            <tr key={r.id}>
                                <td className="py-4 pl-4 text-sm font-light text-gray-900"><strong>{r.block?.district?.state?.name || '—'}</strong></td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{r.siteEngineer?.name || '—'}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{r.siteEngineer?.phone || '—'}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{r.site?.name || '—'}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{r.block?.name || '—'}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{r.block?.district?.name || '—'}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600"><StatusBadge status={r.status} /></td>
                                <td className="py-4 pl-4 text-sm text-brand-600">
                                    <div className="flex flex-wrap gap-1">
                                        {r.items?.map((item: any) => <span key={item.id} className="bg-brand-50 border border-gray-300 text-brand-700 px-2 py-0.5 rounded text-xs">{item.materialName}: {item.modifiedQuantity || item.quantity} {item.unit}</span>)}
                                    </div>
                                </td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                            </tr>
                        )) : <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No requests found</td></tr>}</tbody>
                    </table>
                </div>
                    <Pagination currentPage={currentPage} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setCurrentPage} totalItems={filtered.length} itemName="requests" />
                </div>
            </div>
        </>
    );
}
