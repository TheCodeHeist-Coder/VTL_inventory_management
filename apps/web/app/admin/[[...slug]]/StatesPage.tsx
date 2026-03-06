'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../../../api';
import type { Message } from '../../../types';

export default function StatesPage() {
    const [states, setStates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editState, setEditState] = useState<any>(null);
    const [form, setForm] = useState({ name: '', code: '' });
    const [msg, setMsg] = useState<Message | null>(null);

    const loadData = () => { api.get('/admin/states').then(r => { setStates(r.data); setLoading(false); }); };
    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (editState) { await api.put(`/admin/states/${editState.id}`, form); setMsg({ type: 'success', text: 'State updated!' }); }
            else { await api.post('/admin/states', form); setMsg({ type: 'success', text: 'State created!' }); }
            setShowModal(false); setEditState(null); setForm({ name: '', code: '' }); loadData();
        } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setTimeout(() => setMsg(null), 3000);
    };

    const handleEdit = (s: any) => { setEditState(s); setForm({ name: s.name, code: s.code }); setShowModal(true); };
    const handleDelete = async (id: number) => {
        if (!confirm('Delete this state? All districts will be unlinked.')) return;
        try { await api.delete(`/admin/states/${id}`); setMsg({ type: 'success', text: 'State deleted.' }); loadData(); }
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
    return (
        <>
            <div className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1">State Management</h1><p>Manage states in the system</p></div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-900 text-gray-950 border border-gray-500 cursor-pointer hover:bg-gray-200 rounded-lg font-semibold hover:bg-brand-800 transition-all shadow-lg" onClick={() => { setEditState(null); setForm({ name: '', code: '' }); setShowModal(true); }}> Add State</button>
            </div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden"><div className="p-6">
                {states.length > 0 ? (<div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-gray-400"><th className="pb-3 text-xs font-semibold text-brand-400 uppercase tracking-wider">State Name</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Code</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Districts</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Actions</th></tr></thead>
                        <tbody>{states.map(s => (
                            <tr key={s.id}>
                                <td className="py-4 pl-4 text-sm text-brand-600 tracking-wider"><strong> {s.name}</strong></td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{s.code}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600">{s.districts?.length > 0 ? s.districts.map((d: any) => <span key={d.id} className="inline-flex items-center gap-1.5 px-5 py-1.5 tracking-wider rounded-full text-xs font-bold bg-green-50 border border-green-600" style={{ marginRight: '6px', fontSize: '11px' }}> {d.name}</span>) : <span style={{ color: '#64748b' }}>No districts</span>}</td>
                                <td className="py-4 pl-4 text-sm text-brand-600"><div style={{ display: 'flex', gap: '6px' }}><button className="px-3 py-1.5 bg-green-100  border border-green-500 hover:bg-green-400 cursor-pointer font-bold text-green-600 hover:text-black rounded-md text-xs tracking-wider hover:bg-brand-50" onClick={() => handleEdit(s)}>Edit</button><button className="px-3  py-1.5 border border-rose-500 bg-rose-100 text-rose-600 hover:text-black rounded-md text-xs font-medium hover:bg-rose-400 cursor-pointer" onClick={() => handleDelete(s.id)}>Delete</button></div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>) : <div className="text-center py-12 text-brand-500"><div className="text-5xl mb-4"></div><h3 className="text-base font-bold text-brand-900">No states yet</h3></div>}
            </div></div>

            {showModal && (
                <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e: any) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-gray-100 border border-gray-400 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-xl p-6">
                        <h2 className="text-lg font-bold text-brand-900 mb-5">{editState ? ' Edit State' : ' New State'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">State Name</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Uttar Pradesh" /></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">State Code</label><input className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="e.g. UP" /></div>
                            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-300">
                                <button type="button" className="px-4 cursor-pointer active:scale-95 py-2 border border-brand-200 text-brand-600 rounded-lg" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="px-4 cursor-pointer active:scale-95 border border-gray-800 hover:bg-gray-200 py-2 bg-brand-900 text-black rounded-lg font-medium hover:bg-brand-800 shadow-sm">{editState ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
