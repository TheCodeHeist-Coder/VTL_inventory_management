'use client'

import { FormEvent, useEffect, useState } from "react"
import { Message } from "../../../types";
import api from "../../../api";
import { useFormState } from "react-dom";
import Pagination from "../../../components/Pagination";


const PAGE_SIZE = 10;


export default function UsersPage() {

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showModel, setShowModel] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [states, setStates] = useState<any[]>([]);

    const [districts, setDistricts] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'SITE_ENGINEER', stateId: '', districtId: '', blockId: '', siteId: '' });
    const [msg, setMsg] = useState<Message | null>(null);
    const [filterState, setFilterState] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);


    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/admin/users?limit=100'),
            api.get('/admin/districts'),
            api.get('/admin/blocks'),
            api.get('/admin/sites?limit=100'),
            api.get('/admin/states')
        ]).then(([u, d, b, s, st]) => {
            setUsers(u.data.data || u.data);
            setDistricts(d.data);
            setBlocks(b.data);
            setSites(s.data.data || s.data);
            setStates(st.data);
            setLoading(false);
        })
    }

    useEffect(() => {
        loadData();
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                ...form,
                stateId: form.stateId ? form.stateId : null,
                districtId: form.districtId ? form.districtId : null,
                blockId: form.blockId ? form.blockId : null,
                siteId: form.siteId ? form.siteId as string : null
            }

            if (editUser) {
                if (!payload.password) {
                    delete payload.password;
                    await api.put(`/admin/users/${editUser.id}`, payload);
                    setMsg({ type: 'success', text: 'User Updated!' })
                }
            } else {
                await api.post('/admin/users', payload);
                setMsg({ type: 'success', text: 'User Created Successfully' })

            }

            setShowModel(false);
            setEditUser(null);
            setForm({ name: '', email: '', password: '', phone: '', role: 'SITE_ENGINEER', stateId: '', districtId: '', blockId: '', siteId: '' });
            loadData()


        } catch (error: any) {
            setMsg({ type: 'error', text: error.reponse?.data?.error || 'Failed to save User' })
        }

        setTimeout(() => setMsg(null), 3000);
    }


    // to edite= the user
    const handleEdit = (u: any) => {
        setEditUser(u);
        setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', role: u.role, stateId: u.stateId || '', districtId: u.districtId || '', blockId: u.blockId || '', siteId: u.siteId || '' });
        setShowModel(true);
    };

    // to deactivate the user
    const handleDelete = async (id: number) => {
        if (!confirm('Deactivate this user?')) return;
        await api.delete(`/admin/users/${id}`);
        setMsg({ type: 'success', text: 'User deactivated.' });
        loadData(); setTimeout(() => setMsg(null), 3000);
    };


     if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
        const stateDistrictIds = filterState ? districts.filter(d => d.state?.id === (filterState)).map(d => d.id) : null;
       const filteredUsers = users.filter(u => {
        if (filterState && stateDistrictIds && !stateDistrictIds.includes(u.districtId) && u.stateId !== (filterState)) return false;
        if (filterDistrict && u.districtId !== (filterDistrict)) return false;
        if (filterBlock && u.blockId !== (filterBlock)) return false;
        if (filterRole && u.role !== filterRole) return false;
        return true;
    });

      const filteredDists = filterState ? districts.filter(d => d.state?.id === (filterState)) : districts;
    const filteredBlks = filterDistrict ? blocks.filter(b => b.districtId === (filterDistrict)) : filterState ? blocks.filter(b => stateDistrictIds?.includes(b.districtId)) : blocks;
    const hasFilters = filterState || filterDistrict || filterBlock || filterRole;


    return (
            <>
            <div className="mb-8 " style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1 className="text-2xl font-extrabold text-brand-900 tracking-wider mb-1">User Management</h1><p>Add, edit, and manage system users</p></div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-900 text-gray-950 border border-gray-500 cursor-pointer hover:bg-gray-200 rounded-lg font-semibold hover:bg-brand-800 transition-all shadow-lg" onClick={() => { setEditUser(null); setForm({ name: '', email: '', password: '', phone: '', role: 'SITE_ENGINEER', stateId: '', districtId: '', blockId: '', siteId: '' }); setShowModel(true); }}> Add User</button>
            </div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 flex items-center gap-2.5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

            {/* Filters */}
            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6">
                <div className="p-6" style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>🔍 Filter by:</span>
                        {[
                            { val: filterState, set: (v: string) => { setFilterState(v); setFilterDistrict(''); setFilterBlock(''); }, opts: states.map(s => ({ id: s.id, label: `🏛️ ${s.name}` })), placeholder: 'All States' },
                            { val: filterDistrict, set: (v: string) => { setFilterDistrict(v); setFilterBlock(''); }, opts: filteredDists.map(d => ({ id: d.id, label: `🏢 ${d.name}` })), placeholder: 'All Districts' },
                            { val: filterBlock, set: (v: string) => setFilterBlock(v), opts: filteredBlks.map(b => ({ id: b.id, label: `📋 ${b.name}` })), placeholder: 'All Blocks' },
                        ].map((f, i) => (
                            <div key={i} style={{ minWidth: '160px' }}>
                                <select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-900/20 transition-all cursor-pointer appearance-none" value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                                    <option value="">{f.placeholder}</option>
                                    {f.opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                </select>
                            </div>
                        ))}
                        <div style={{ minWidth: '180px' }}>
                            <select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                                <option value="">All Roles</option><option value="ADMIN">Admin</option><option value="STATE_HEAD">State Head</option><option value="DISTRICT_HEAD">District Head</option><option value="BLOCK_MANAGER">Block Manager</option><option value="STORE_MANAGER">Store Manager</option><option value="SITE_ENGINEER">Site Engineer</option>
                            </select>
                        </div>
                        {hasFilters && <button className="px-3 border border-rose-600 text-brand-600 bg-rose-300 cursor-pointer py-2 rounded-md text-xs font-medium hover:bg-rose-500  transition-colors" onClick={() => { setFilterState(''); setFilterDistrict(''); setFilterBlock(''); setFilterRole(''); setCurrentPage(1); }}>✕ Clear</button>}
                        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>Showing {filteredUsers.length} of {users.length} users</span>
                    </div>
                </div>
            </div>

            {/* Users table */}
            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6"><div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-gray-400"><th className="pb-3 text-xs font-semibold text-brand-400 uppercase tracking-wider">Name</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Email</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Phone</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Role</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">State</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">District</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Block</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Site</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Actions</th></tr></thead>
                        <tbody>{(() => {
                            const paged = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
                            return paged.length > 0 ? paged.map(u => (
                                <tr key={u.id}>
                                    <td className="py-4 pl-4 text-sm text-brand-600 tracking-wide"><strong>{u.name}</strong></td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{u.email}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{u.phone || '—'}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">{u.role.replace(/_/g, ' ')}</span></td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{u.state?.name || u.district?.state?.name || '—'}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{u.district?.name || '—'}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{u.block?.name || '—'}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{u.site?.name || '—'}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600"><div style={{ display: 'flex', gap: '6px' }}><button className="px-3 py-1.5 border  hover:bg-green-300 bg-green-50 hover:text-black font-bold text-green-600 cursor-pointer border-brand-200 text-brand-600 rounded-md text-xs   transition-colors" onClick={() => handleEdit(u)}>Edit</button><button className="px-3 py-1.5 font-bold hover:bg-rose-400 hover:text-black bg-rose-100 text-rose-600 cursor-pointer border border-brand-200 text-brand-600 rounded-md text-xs hover:bg-brand-50 transition-colors" onClick={() => handleDelete(u.id)}>Delete</button></div></td>
                                </tr>
                            )) : <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No users match filters</td></tr>;
                        })()}</tbody>
                    </table>
                </div>
                    <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredUsers.length / PAGE_SIZE)} onPageChange={setCurrentPage} totalItems={filteredUsers.length} itemName="users" />
                </div>
            </div>

            {/* Modal */}
            {showModel && (
                <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e: any) => e.target === e.currentTarget && setShowModel(false)}>
                    <div className="bg-white border border-brand-200 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-xl p-6">
                        <h2 className="text-lg font-bold text-brand-900 mb-5">{editUser ? ' Edit User' : ' New User'}</h2>
                        <form onSubmit={handleSubmit}>
                            {['name', 'email', 'phone'].map(f => (
                                <div key={f} className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">{f}{f === 'email' ? '' : ''}</label><input className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all" type={f === 'email' ? 'email' : 'text'} value={(form as any)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required={f !== 'phone'} /></div>
                            ))}
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Password {editUser && '(leave blank to keep)'}</label><input className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} {...(!editUser && { required: true })} /></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Role</label><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="ADMIN">Admin</option><option value="STATE_HEAD">State Head</option><option value="DISTRICT_HEAD">District Head</option><option value="BLOCK_MANAGER">Block Manager</option><option value="STORE_MANAGER">Store Manager</option><option value="SITE_ENGINEER">Site Engineer</option></select></div>
                            {form.role === 'STATE_HEAD' && <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">State</label><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={form.stateId} onChange={e => setForm({ ...form, stateId: e.target.value })}><option value="">— Select —</option>{states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">District</label><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={form.districtId} onChange={e => setForm({ ...form, districtId: e.target.value })}><option value="">— None —</option>{districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                            <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Block</label><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={form.blockId} onChange={e => setForm({ ...form, blockId: e.target.value, siteId: '' })}><option value="">— None —</option>{blocks.filter(b => !form.districtId || b.districtId === (form.districtId)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            {form.role === 'SITE_ENGINEER' && <div className="mb-5"><label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Site</label><select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })}><option value="">— None —</option>{sites.filter(s => !form.blockId || s.blockId === (form.blockId)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
                            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-brand-100">
                                <button type="button" className="px-4 py-2 border border-brand-200 text-brand-600 active:scale-95 cursor-pointer rounded-lg font-medium hover:bg-brand-50 transition-colors" onClick={() => setShowModel(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-900 text-gray-950 cursor-pointer active:scale-95 rounded-lg font-medium hover:bg-brand-800 shadow-sm">{editUser ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}