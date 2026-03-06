'use client';

import { useState, useEffect, FormEvent } from 'react';
import { use } from 'react';
import Layout from '../../../components/Layout';
import StatusBadge from '../../../components/StatusBedge';
import api from '../../../api';
import type { NavItem, Message } from '../../../types';
import { VscGitPullRequestGoToChanges } from 'react-icons/vsc';
import { MdFreeCancellation, MdMarkChatRead, MdPendingActions } from 'react-icons/md';
import { FcApproval } from 'react-icons/fc';
import { RiUserReceivedFill } from 'react-icons/ri';

const navItems: NavItem[] = [
    { path: '/site-engineer', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/site-engineer/new-request', label: 'New Request', icon: '➕' },
];

function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<Message | null>(null);
    const [user, setUser] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    const loadData = () => {
        api.get('/siteEngg/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        setMounted(true);
        loadData();
    }, []);

    const markReceived = async (id: number) => {
        try {
            await api.put(`/site-engineer/requests/${id}/received`);
            setMsg({ type: 'success', text: 'Material marked as received!' });
            loadData();
        } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setTimeout(() => setMsg(null), 3000);
    };

   if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
    if (!data) return <div className="p-4 rounded-lg text-sm font-medium mb-5 bg-rose-50 text-rose-700 border border-rose-200">Failed to load</div>;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1"> Site Engineer Dashboard</h1>
                <p className='mb-3'>Track and manage your material requests</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {mounted && user.stateName && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{user.stateName}</span>}
                    {data.block?.district?.name && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"> {data.block.district.name}</span>}
                    {data.block?.name && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"> {data.block.name}</span>}
                    {data.site && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"> {data.site.name}</span>}
                </div>
            </div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-12 ">
                {[
                    { icon: <VscGitPullRequestGoToChanges className='w-10 h-10 text-gray-900' />, val: data.stats.total, label: 'Total Requests', cls: 'blue' },
                    { icon: <MdPendingActions className='w-10 h-10 text-gray-900' />, val: data.stats.pending, label: 'Pending', cls: 'amber' },
                    { icon: <FcApproval className='w-10 h-10 text-black' />, val: data.stats.approved, label: 'Approved', cls: 'green' },
                    { icon: <MdMarkChatRead className='w-10 h-10 text-gray-900' />, val: data.stats.fulfilled, label: 'Ready', cls: 'purple' },
                    { icon:  <RiUserReceivedFill className='w-10 h-10 text-gray-900' />, val: data.stats.received, label: 'Received', cls: 'cyan' },
                    { icon: <MdFreeCancellation className='w-10 h-10 text-gray-900'/>, val: data.stats.rejected, label: 'Rejected', cls: 'rose' },
                ].map(s => (
                    <div key={s.label} className={`stat-bg-white border py-3 px-4 border-gray-300 rounded-xl shadow-xl overflow-hidden ${s.cls}`}>
                        <div className="text-3xl mb-3">{s.icon}</div>
                        <div className="text-lg tracking-wide text-gray-800 font-semibold">{s.label}</div>
                        <div className="text-3xl font-extrabold leading-none mt-1.5 text-brand-900">{s.val}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-12">
                <div className="px-6 py-5 border-b border-gray-400 bg-brand-50/50 flex items-center gap-2">
                    <h3 className="text-lg font-bold tracking-wide text-gray-900">Emergency Contacts</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { role: 'Store Manager', emoji: '🏪', people: data.contacts?.storeManagers || [], color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                            { role: 'Block Manager', emoji: '📋', people: data.contacts?.blockManagers || [], color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                            { role: 'District Head', emoji: '🏢', people: data.contacts?.districtHeads || [], color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
                        ].map(({ role, emoji, people, color, bg, border }) => (
                            <div key={role} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{emoji} {role}</div>
                                {people.length > 0 ? people.map((p: any) => (
                                    <div key={p.id} style={{ marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{p.name}</div>
                                        {p.phone ? (
                                            <a href={`tel:${p.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '13px', color, fontWeight: 600, textDecoration: 'none' }}>
                                                📞 {p.phone}
                                            </a>
                                        ) : (
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>No phone on file</div>
                                        )}
                                        {p.email && <div className='text-[13px] text-gray-800 mt-1 tracking-wide'>✉️ {p.email}</div>}
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>None assigned</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-300 bg-brand-50/50"><h3 className="text-lg font-bold text-gray-900"> My Requests</h3></div>
                <div className="p-6 flex flex-col gap-7">
                    {data.requests?.length > 0 ? data.requests.map((r: any) => (
                        <div key={r.id} className="request-bg-white border border-gray-500 p-3 rounded-xl shadow-xl overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                                <div><div className="text-xs font-semibold  text-gray-950 mt-1"> {new Date(r.createdAt).toLocaleString()}</div></div>
                                <StatusBadge status={r.status} />
                            </div>
                            <div className="flex flex-wrap gap-2 my-3">
                                {r.items?.map((item: any) => <span key={item.id} className="bg-brand-50 border border-gray-400 text-brand-700 px-3 py-1 rounded-full text-xs font-medium">{item.materialName}: {item.modifiedQuantity ? <><s>{item.quantity}</s> → {item.modifiedQuantity}</> : item.quantity} {item.unit}</span>)}
                            </div>
                            {r.remarks && <div className="text-sm text-brand-500 italic mt-2 bg-brand-50 p-3 rounded-lg border border-gray-300">💬 {r.remarks}</div>}
                            {r.status === 'FULFILLED' && <div className="flex gap-2 mt-4"><button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-sm text-sm" onClick={() => markReceived(r.id)}>✅ Mark as Received</button></div>}
                        </div>
                    )) : <div className="text-center py-12 text-brand-500"><div className="text-5xl mb-4">📭</div><h3 className="text-base font-bold text-brand-900">No requests yet</h3></div>}
                </div>
            </div>
        </>
    );
}

function NewRequestPage() {
    const [items, setItems] = useState([{ materialName: '', quantity: '', unit: 'Bags' }]);
    const [remarks, setRemarks] = useState('');
    const [msg, setMsg] = useState<Message | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const valid = items.filter(i => i.materialName && i.quantity);
            if (!valid.length) { setMsg({ type: 'error', text: 'Add at least one item.' }); setSubmitting(false); return; }
            await api.post('/site-engineer/requests', { items: valid, remarks });
            setMsg({ type: 'success', text: 'Request submitted! 🎉' });
            setItems([{ materialName: '', quantity: '', unit: 'Bags' }]);
            setRemarks('');
        } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setSubmitting(false);
        setTimeout(() => setMsg(null), 4000);
    };

    return (
        <>
            <div className="mb-8"><h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1"> New Material Request</h1><p>Request materials for your construction site</p></div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}
            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <h3 className='text-lg font-bold tracking-wide text-gray-900'>Materials Needed</h3>
                        {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end', padding: '16px', borderRadius: '10px', border: '1px solid rgba(226,232,240,0.5)' }}>
                                <div style={{ flex: 2 }}>
                                    <label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Material</label>
                                    <input className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-900/60 transition-all placeholder:text-brand-300" value={item.materialName} onChange={e => { const c = [...items]; c[i]!.materialName = e.target.value; setItems(c); }} placeholder="e.g., Cement" required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Qty</label>
                                    <input className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-900/20 transition-all" type="number" value={item.quantity} onChange={e => { const c = [...items]; c[i]!.quantity = e.target.value; setItems(c); }} required min="1" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Unit</label>
                                    <select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={item.unit} onChange={e => { const c = [...items]; c[i]!.unit = e.target.value; setItems(c); }}>
                                        <option>Bags</option><option>Quintals</option><option>Cubic Meters</option><option>Pieces</option><option>Meters</option><option>Liters</option><option>Kg</option><option>Tons</option>
                                    </select>
                                </div>
                                {items.length > 1 && <button type="button" className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-md text-xs font-medium hover:bg-brand-50 transition-colors" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>🗑️</button>}
                            </div>
                        ))}
                        <button type="button" className="px-8 py-2 border border-brand-200 text-brand-600 rounded-lg cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95 tracking-wide bg-gray-950 text-white font-bold hover:bg-brand-50  mb-6" onClick={() => setItems([...items, { materialName: '', quantity: '', unit: 'Bags' }])}> Add Item</button>
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Remarks</label>
                            <textarea className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-900/20 transition-all" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional notes..." />
                        </div>
                        <button type="submit" className="w-96 px-4 py-2 bg-gray-950 text-white rounded-lg font-medium hover:bg-brand-800 tracking-wider cursor-pointer hover:scale-105 transition-all duration-400 shadow-sm" disabled={submitting}>{submitting ? '⏳ Submitting...' : '📤 Submit Request'}</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default function SiteEngineerDashboard({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = use(params);
    const path = slug[0] || '';
    const renderPage = () => {
        switch (path) {
            case '': return <Dashboard />;
            case 'new-request': return <NewRequestPage />;
            default: return <Dashboard />;
        }
    };
    return <Layout navItems={navItems}>{renderPage()}</Layout>;
}
