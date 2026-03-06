'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../../../api';
import type { Message } from '../../../types';

export default function DistrictsPage() {
    const [districts, setDistricts] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDistrictModal, setShowDistrictModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [districtForm, setDistrictForm] = useState({ name: '', code: '', stateId: '' });
    const [blockForm, setBlockForm] = useState({ name: '', code: '', districtId: '' });
    const [msg, setMsg] = useState<Message | null>(null);
    const [filterState, setFilterState] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');

    const loadData = () => { Promise.all([api.get('/admin/districts'), api.get('/admin/states')]).then(([d, s]) => { setDistricts(d.data); setStates(s.data); setLoading(false); }); };
    useEffect(() => { loadData(); }, []);

    const createDistrict = async (e: FormEvent) => {
        e.preventDefault();
        try { await api.post('/admin/districts', { ...districtForm, stateId: districtForm.stateId ? (districtForm.stateId) : null }); setShowDistrictModal(false); setDistrictForm({ name: '', code: '', stateId: '' }); loadData(); setMsg({ type: 'success', text: 'District created!' }); }
        catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setTimeout(() => setMsg(null), 3000);
    };

    const createBlock = async (e: FormEvent) => {
        e.preventDefault();
        try { await api.post('/admin/blocks', { ...blockForm, districtId: (blockForm.districtId) }); setShowBlockModal(false); setBlockForm({ name: '', code: '', districtId: '' }); loadData(); setMsg({ type: 'success', text: 'Block created!' }); }
        catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setTimeout(() => setMsg(null), 3000);
    };

     if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
    const filteredDistricts = districts.filter(d => { if (filterState && d.state?.id !== (filterState)) return false; if (filterDistrict && d.id !== (filterDistrict)) return false; return true; });
    const districtOptions = filterState ? districts.filter(d => d.state?.id === (filterState)) : districts;
    const totalBlocks = filteredDistricts.reduce((sum, d) => sum + (d.blocks?.length || 0), 0);
    const hasFilters = filterState || filterDistrict;

  

    return (
        <>
            <div className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1">Districts & Blocks</h1><p className='tracking-wide'>Manage organizational hierarchy</p></div>
                <div style={{ display: 'flex', gap: '10px' }}><button className="px-4 py-2 bg-pink-100 border border-pink-600 cursor-pointer text-black rounded-lg font-medium hover:bg-brand-800 shadow-sm" onClick={() => setShowDistrictModal(true)}>Add District</button><button className="px-4 py-2 bg-green-100 border border-green-500 text-black rounded-lg font-medium hover:bg-green-400 cursor-pointer shadow-sm" onClick={() => setShowBlockModal(true)}>Add Block</button></div>
            </div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

            {/* Filters */}
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden mb-6"><div className="p-6" style={{ padding: '16px 24px' }}><div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>🔍 Filter by:</span>
                <div style={{ minWidth: '180px' }}><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={filterState} onChange={e => { setFilterState(e.target.value); setFilterDistrict(''); }} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All States</option>{states.map(s => <option key={s.id} value={s.id}>🏛️ {s.name}</option>)}</select></div>
                <div style={{ minWidth: '220px' }}><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All Districts</option>{districtOptions.map(d => <option key={d.id} value={d.id}>🏢 {d.name}</option>)}</select></div>
                {hasFilters && <button className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-md text-xs font-medium hover:bg-brand-50" onClick={() => { setFilterState(''); setFilterDistrict(''); }}>✕ Clear</button>}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>Showing {filteredDistricts.length} of {districts.length} districts · {totalBlocks} blocks</span>
            </div></div></div>

            {filteredDistricts.map(d => (
              
                <div key={d.id} className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-gray-400 flex items-center justify-between bg-brand-50/50">
                        <h3 className="text-base font-bold text-brand-900"> {d.name} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 400 }}>({d.code}){d.state && ` — 🏛️ ${d.state.name}`}</span></h3>
                        <span className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200'> {d.users.length || 0} users </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">{d.blocks?.length || 0} Blocks</span>
                    </div>
                    <div className="p-6">
                        {d.blocks?.length > 0 ? (<div className="overflow-x-auto -mx-6 px-6"><table className="w-full text-left border-collapse">
                            <thead><tr className="border-b border-gray-300"><th className="pb-3 text-xs font-semibold text-brand-400 uppercase tracking-wider">Block</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Code</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Inventory</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Sites</th></tr></thead>
                            <tbody>{d.blocks.map((b: any) => (<tr key={b.id}><td className="py-4 pl-4 text-sm text-brand-600"><strong> {b.name}</strong></td><td className="py-4 pl-4 text-sm text-brand-600">{b.code}</td><td className="py-4 pl-4 text-sm text-brand-600">{b.inventory?.items?.length || 0} items</td><td className="py-4 pl-4 text-sm text-brand-600">{b.sites?.length || 0} sites</td></tr>))}</tbody>
                        </table></div>) : <div className="text-center py-12 text-brand-500"><p>No blocks</p></div>}
                    </div>
                </div>
            ))}
            {filteredDistricts.length === 0 && <div className="text-center py-12 text-brand-500"><div className="text-5xl mb-4">🔍</div><h3 className="text-base font-bold text-brand-900">{hasFilters ? 'No districts match filters' : 'No districts yet'}</h3></div>}

            {showDistrictModal && (
                <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e: any) => e.target === e.currentTarget && setShowDistrictModal(false)}>
                    <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-xl shadow-xl p-6">
                        <h2 className="text-lg font-bold text-brand-900 mb-5"> New District</h2>
                        <form onSubmit={createDistrict}>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">State</label><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer" value={districtForm.stateId} onChange={e => setDistrictForm({ ...districtForm, stateId: e.target.value })}><option value="">— None —</option>{states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Name</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm" value={districtForm.name} onChange={e => setDistrictForm({ ...districtForm, name: e.target.value })} required /></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Code</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm" value={districtForm.code} onChange={e => setDistrictForm({ ...districtForm, code: e.target.value })} required placeholder="e.g. LKO" /></div>
                            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-brand-100"><button type="button" className="px-4 active:scale-95 py-2 border border-gray-500 cursor-pointer text-brand-600 rounded-lg" onClick={() => setShowDistrictModal(false)}>Cancel</button><button type="submit" className="px-4 py-2 active:scale-95 bg-brand-900 cursor-pointer text-black border border-gray-500 rounded-lg font-medium shadow-sm">Create</button></div>
                        </form>
                    </div>
                </div>
            )}
            {showBlockModal && (
                <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e: any) => e.target === e.currentTarget && setShowBlockModal(false)}>
                    <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-xl shadow-xl p-6">
                        <h2 className="text-lg font-bold text-brand-900 mb-5"> New Block</h2>
                        <form onSubmit={createBlock}>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">District</label><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer" value={blockForm.districtId} onChange={e => setBlockForm({ ...blockForm, districtId: e.target.value })} required><option value="">Select district</option>{districts.map(d => <option key={d.id} value={d.id}>{d.name}{d.state ? ` (${d.state.name})` : ''}</option>)}</select></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Name</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm" value={blockForm.name} onChange={e => setBlockForm({ ...blockForm, name: e.target.value })} required /></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Code</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm" value={blockForm.code} onChange={e => setBlockForm({ ...blockForm, code: e.target.value })} required placeholder="e.g. LKO-CHT" /></div>
                            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-300"><button type="button" className="px-4 py-2 border border-gray-500 text-brand-600 rounded-lg cursor-pointer" onClick={() => setShowBlockModal(false)}>Cancel</button><button type="submit" className="px-4 py-2 bg-green-500 text-black rounded-lg font-medium shadow-sm cursor-pointer">Create</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
