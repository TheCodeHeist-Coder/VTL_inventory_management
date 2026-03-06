'use client';

import { useState, useEffect, FormEvent } from 'react';
import Pagination from '../../../components/Pagination';
import api from '../../../api';
import type { Message } from '../../../types';

const PAGE_SIZE = 10;

export default function SitesPage() {
    const [sites, setSites] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editSite, setEditSite] = useState<any>(null);
    const [form, setForm] = useState({ name: '', code: '', blockId: '', districtId: '' });
    const [msg, setMsg] = useState<Message | null>(null);
    const [filterState, setFilterState] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = () => { Promise.all([api.get('/admin/sites?limit=100'), api.get('/admin/blocks'), api.get('/admin/districts'), api.get('/admin/states')]).then(([s, b, d, st]) => { setSites(s.data.data || s.data); setBlocks(b.data); setDistricts(d.data); setStates(st.data); setLoading(false); }); };
    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form, blockId: (form.blockId) };
            if (editSite) { await api.put(`/admin/sites/${editSite.id}`, payload); setMsg({ type: 'success', text: 'Site updated!' }); }
            else { await api.post('/admin/sites', payload); setMsg({ type: 'success', text: 'Site created!' }); }
            setShowModal(false); setEditSite(null); setForm({ name: '', code: '', blockId: '', districtId: '' }); loadData();
        } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setTimeout(() => setMsg(null), 3000);
    };

    const handleEdit = (s: any) => { setEditSite(s); setForm({ name: s.name, code: s.code, blockId: s.blockId, districtId: s.block?.district?.id?.toString() || '' }); setShowModal(true); };
    const handleDelete = async (id: number) => { if (!confirm('Delete this site?')) return; await api.delete(`/admin/sites/${id}`); loadData(); setMsg({ type: 'success', text: 'Site deleted.' }); setTimeout(() => setMsg(null), 3000); };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
    const stateDistrictIds = filterState ? districts.filter(d => d.state?.id === (filterState)).map(d => d.id) : null;
    const filteredSites = sites.filter(s => {
        if (filterState && stateDistrictIds && !stateDistrictIds.includes(s.block?.district?.id)) return false;
        if (filterDistrict && s.block?.district?.id !== (filterDistrict)) return false;
        if (filterBlock && s.block?.id !== (filterBlock)) return false;
        return true;
    });
    const filteredDists = filterState ? districts.filter(d => d.state?.id === (filterState)) : districts;
    const filteredBlks = filterDistrict ? blocks.filter(b => b.districtId === (filterDistrict)) : filterState ? blocks.filter(b => stateDistrictIds?.includes(b.districtId)) : blocks;

    const sitesByBlock: Record<string, { block: any; sites: any[] }> = {};
    filteredSites.forEach(s => { const key = s.block?.id || 0; if (!sitesByBlock[key]) sitesByBlock[key] = { block: s.block, sites: [] }; sitesByBlock[key].sites.push(s); });
    const blockGroupKeys = Object.keys(sitesByBlock);
    const totalBlockPages = Math.ceil(blockGroupKeys.length / PAGE_SIZE);
    const pagedBlockKeys = blockGroupKeys.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const hasFilters = filterState || filterDistrict || filterBlock;

    return (
        <>
            <div className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1">Site Management</h1><p>Manage construction sites</p></div>
                <button className="px-4 py-2 border border-gray-300 bg-brand-900 text-black rounded-lg font-medium cursor-pointer hover:bg-gray-100 shadow-lg" onClick={() => { setEditSite(null); setForm({ name: '', code: '', blockId: '', districtId: '' }); setShowModal(true); }}> Add  Site</button>
            </div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6"><div className="p-6" style={{ padding: '16px 24px' }}><div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>🔍 Filter:</span>
                <div style={{ minWidth: '160px' }}><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer appearance-none" value={filterState} onChange={e => { setFilterState(e.target.value); setFilterDistrict(''); setFilterBlock(''); }} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All States</option>{states.map(s => <option key={s.id} value={s.id}>🏛️ {s.name}</option>)}</select></div>
                <div style={{ minWidth: '180px' }}><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer appearance-none" value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setFilterBlock(''); }} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All Districts</option>{filteredDists.map(d => <option key={d.id} value={d.id}>🏢 {d.name}</option>)}</select></div>
                <div style={{ minWidth: '180px' }}><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer appearance-none" value={filterBlock} onChange={e => setFilterBlock(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All Blocks</option>{filteredBlks.map(b => <option key={b.id} value={b.id}>📋 {b.name}</option>)}</select></div>
                {hasFilters && <button className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-md text-xs" onClick={() => { setFilterState(''); setFilterDistrict(''); setFilterBlock(''); setCurrentPage(1); }}>✕ Clear</button>}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>{filteredSites.length} sites</span>
            </div></div></div>

            {pagedBlockKeys.length > 0 ? pagedBlockKeys.map(key => {
                const group = sitesByBlock[key];
                return (
                    <div key={group?.block?.id} className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6">
                        <div className="px-6 py-5 border-b border-gray-400 flex items-center justify-between bg-brand-50/50">
                            <h3 className="text-base font-bold text-brand-900">📋 {group?.block?.name} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 400 }}>— {group?.block?.district?.name}</span></h3>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">{group?.sites.length} Sites</span>
                        </div>
                        <div className="p-6"><div className="overflow-x-auto -mx-6 px-6"><table className="w-full text-left border-collapse">
                            <thead><tr className="border-b border-gray-300"><th className="pb-3 text-xs font-semibold text-brand-400 uppercase tracking-wider">Site</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Code</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Site-Engineers</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Actions</th></tr></thead>
                            <tbody>{group?.sites.map(s => (
                                <tr key={s.id}>
                                    <td className="py-4 pl-4 text-sm text-brand-600"><strong> {s.name}</strong></td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{s.code}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{s.users?.length > 0 ? s.users.map((u: any) => <div key={u.id} style={{ marginBottom: '4px' }}><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ fontSize: '11px' }}>👷 {u.name}</span>{u.phone && <span className='ml-2'>📞 {u.phone}</span>}</div>) : <span style={{ color: '#64748b' }}>No engineers</span>}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600"><div style={{ display: 'flex', gap: '9px' }}><button className="px-3 py-1.5 border border-brand-200 text-green-800 font-bold hover:text-black cursor-pointer rounded-md text-xs  hover:bg-green-400 bg-green-300" onClick={() => handleEdit(s)}>Edit</button><button className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-md text-xs hover:bg-rose-400 hover:text-black bg-rose-300 text-rose-600 font-bold cursor-pointer" onClick={() => handleDelete(s.id)}>Delete</button></div></td>
                                </tr>
                            ))}</tbody>
                        </table></div></div>
                    </div>
                );
            }) : <div className="text-center py-12 text-brand-500"><div className="text-5xl mb-4">🏗️</div><h3 className="text-base font-bold text-brand-900">{hasFilters ? 'No sites match filters' : 'No sites yet'}</h3></div>}
            <Pagination currentPage={currentPage} totalPages={totalBlockPages} onPageChange={setCurrentPage} totalItems={filteredSites.length} itemName="sites" />

            {showModal && (
                <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e: any) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-xl shadow-xl p-6">
                        <h2 className="text-lg font-bold text-brand-900 mb-5">{editSite ? '✏️ Edit Site' : '➕ New Site'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">District</label><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer" value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value, blockId: '' })}><option value="">All Districts</option>{districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Block</label><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer" value={form.blockId} onChange={e => setForm({ ...form, blockId: e.target.value })} required><option value="">Select block</option>{blocks.filter(b => !form.districtId || b.districtId === (form.districtId)).map(b => <option key={b.id} value={b.id}>{b.name} — {b.district?.name}</option>)}</select></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Name</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Code</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="e.g. CHT-A" /></div>
                            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-300"><button type="button" className="px-4 py-2 border border-gray-400 text-brand-600 rounded-lg cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="px-4 py-2 bg-brand-900 text-black rounded-lg font-medium shadow-sm border border-gray-400 cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95">{editSite ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
