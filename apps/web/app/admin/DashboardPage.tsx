'use client'

import { useEffect, useState } from "react"
import api from "../../api";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdOutlineAccountBalance } from "react-icons/md";
import { FaRegBuilding, FaSitemap } from "react-icons/fa";
import { TbBuildingCommunity } from "react-icons/tb";
import { HiUsers } from "react-icons/hi";
import { FaCodePullRequest } from "react-icons/fa6";
import StatusBadge from "../../components/StatusBedge";

export default function DashboardPage() {

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [timePeriod, setTimePeriod] = useState('all');
    const [filterState, setFilterstate] = useState('');
    const [states, setStates] = useState<any[]>([]);

    const loadDashboard = (stateId: string) => {
        setLoading(true);

        const url = stateId ? `admin/dashboard?stateId=${stateId}` : '/admin/dashboard';
        api.get(url)
            .then(r => { setData(r.data); setLoading(false) })
            .catch(() => setLoading(false))
    };


    useEffect(() => {
        api.get('/admin/states')
            .then(r => setStates(r.data));
        loadDashboard('');
    }, [])


    const handleStateFilter = (val: string) => {
        setFilterstate(val);
        loadDashboard(val);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-4 rounded-lg text-sm font-medium mb-5 bg-rose-50 text-rose-700 border border-rose-200">Failed to load dashboard</div>
        )
    }

    const now = new Date();

    const filterRequest = (data.recentRequests || []).filter((r: any) => {
        if (timePeriod === 'all') return true;
        const created = new Date(r.createdAt);
        if (timePeriod === 'weak') {
            const d = new Date(now);
            d.setDate(now.getDate() - 7);
            return created >= d;
        }

        if (timePeriod === 'month') {
            const d = new Date(now);
            d.setMonth(now.getMonth() - 1);
            return created >= d;
        }

        return true;
    })

    const user = JSON.parse(localStorage.getItem('user') || '{}');


    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-normal text-brand-900 mb-1">Admin Dashboard</h1>
                <p>Complete overview of the construction inventory system</p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {user.stateName && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ fontSize: '12px' }}>🏠️ State: {user.stateName}</span>}
                    {user.districtName && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ fontSize: '12px' }}>🏢 District: {user.districtName}</span>}
                    {user.blockName && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ fontSize: '12px' }}>📋 Block: {user.blockName}</span>}
                </div>
            </div>


            {/*  state filter*/}
            <div className="bg-white px-4 py-2  rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="">

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="text-gray-900">🏛️ Filter by State:</span>
                        <div className="relative min-w-50">
                            <select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none transition-all cursor-pointer appearance-none" value={filterState} onChange={e => handleStateFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                                <option value="">All States </option>
                                {states.map((s: any) => <option key={s.id} value={s.id}>🏛️ {s.name}</option>)}
                            </select>
                            <RiArrowDropDownLine className="w-9 h-9 text-gray-950 absolute top-0 right-0" />
                        </div>
                        {filterState && <button className="px-3  py-2 border border-rose-500 text-gray-950 rounded-md text-xs bg-rose-200 font-medium hover:bg-brand-50 transition-colors cursor-pointer hover:bg-rose-300" onClick={() => handleStateFilter('')}>✕ Clear</button>}
                        {filterState && <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 500 }}>Showing stats for: {states.find((s: any) => s.id === (filterState))?.name}</span>}
                    </div>
                </div>
            </div>


            {/* stats Cards */}

            <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

                {[
                    { icon: <MdOutlineAccountBalance className="w-9 h-9 font-extralight " />, val: data.stats.states, label: 'States', bg: 'linear-gradient(135deg, #7c3aed22, #7c3aed11)' },
                    { icon: <FaRegBuilding className="w-8 h-8 text-gray-800 " />, val: data.stats.districts, label: 'Districts' },
                    { icon: <TbBuildingCommunity className="w-9 h-9 font-extralight " />, val: data.stats.blocks, label: 'Blocks' },
                    { icon: <FaSitemap className="w-9 h-9 font-extralight " />, val: data.stats.sites || 0, label: 'Sites' },
                    { icon: <HiUsers className="w-9 h-9 font-extralight " />, val: data.stats.users, label: 'Active Users' },
                    { icon: <FaCodePullRequest className="w-9 h-9 font-extralight " />, val: data.stats.totalRequests, label: 'Total Requests' },
                ].map(s => (
                    <div className="bg-white shadow-xl rounded-xl flex flex-col gap-1 justify-center pl-4 py-5  overflow-hidden" >
                        <div className="mb-1"> {s.icon} </div>
                        <div className="text-2xl font-semibold tracking-wide text-gray-800 ">{s.label}</div>
                        <div className="text-3xl font-extrabold leading-none mb-1 text-brand-900">{s.val}</div>
                    </div>
                ))}

            </div>

            {/* statewise breaksown */}
            {data.statesData?.length > 0 && (
                <div className="bg-white shadow-xl border border-brand-200 rounded-xl  overflow-hidden mb-8">
                    <div className="px-6 py-5 border-b border-brand-200 bg-brand-50/50"><h3 className="text-base tracking-wider font-bold text-gray-950"> Statewise Overview</h3></div>
                    <div className="p-6"><div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="border-b border-brand-200"><th className="pb-3 text-xs font-semibold text-brand-400 uppercase tracking-wider">State</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Districts</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">District Names</th></tr></thead>
                            <tbody>{data.statesData.map((s: any) => (
                                <tr key={s.id}>
                                    <td className="py-4 pl-4 text-sm text-brand-600"><strong> {s.name}</strong> <span style={{ color: '#64748b', fontSize: '12px' }}>({s.code})</span></td>
                                    <td className="py-4 pl-4 text-md font-semibold text-gray-900">{s.districts?.length || 0}</td>
                                    <td className="py-4 pl-4 text-sm text-brand-600">{s.districts?.map((d: any) => <span key={d.id} className="inline-flex items-center gap-1.5 px-3 py-1  rounded-full text-lg font-bold tracking-wider border border-green-500 bg-green-50" style={{ marginRight: '6px', fontSize: '11px' }}> {d.name}</span>)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div></div>
                </div>
            )}


            {/* requessts through graph */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
                <div className="stat-bg-white border border-brand-200 rounded-xl shadow-xl overflow-hidden amber" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
                    <div className="text-3xl mb-3" style={{ fontSize: '36px' }}>⏳</div>
                    <div className="text-3xl font-extrabold leading-none mb-1 text-brand-900" style={{ fontSize: '48px' }}>{data.stats.pendingRequests}</div>
                    <div className="text-sm text-brand-500 font-medium" style={{ fontSize: '16px' }}>Pending Requests</div>
                </div>
                <div className="bg-white  border border-brand-200 rounded-xl shadow-xl overflow-hidden" style={{ margin: 0 }}>
                    <div className="px-6 py-5 border-b border-brand-200 bg-brand-50/50"><h3 className="text-base font-bold text-brand-900">📊 Request Breakdown</h3></div>
                    <div className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: 'Approved', value: data.stats.approvedRequests, color: '#3b82f6' },
                            { label: 'Fulfilled', value: data.stats.fulfilledRequests, color: '#22c55e' },
                            { label: 'Cancelled', value: data.stats.cancelledRequests, color: '#f43f5e' },
                            { label: 'Pending', value: data.stats.pendingRequests, color: '#f59e0b' },
                        ].map(item => {
                            const max = Math.max(data.stats.totalRequests, 1);
                            const pct = Math.round((item.value / max) * 100);
                            return (
                                <div key={item.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                        <span className="text-gray-900"> {item.label}</span>
                                        <span className="text-gray-950 font-semibold">{item.value} ({pct}%)</span>
                                    </div>
                                    <div style={{ background: 'rgba(226,232,240,0.3)', borderRadius: '8px', height: '28px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`, borderRadius: '8px', transition: 'width 0.6s ease', minWidth: item.value > 0 ? '24px' : '0' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


            {/* Recent Requests */}
            <div className="bg-white border border-brand-200 rounded-xl shadow-xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-brand-200 flex items-center justify-between bg-brand-50/50">
                    <h3 className="text-base font-bold text-brand-900">📦 Material Requests</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{filterRequest.length} results</span>
                        <select className="px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 cursor-pointer appearance-none" value={timePeriod} onChange={e => setTimePeriod(e.target.value)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                            <option value="all">📅 All Time</option><option value="week">📆 This Week</option><option value="month">🗓️ This Month</option>
                        </select>
                    </div>
                </div>
                <div className="p-6">
                    {filterRequest.length > 0 ? (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="w-full text-left border-collapse">
                                <thead><tr className="border-b border-brand-200"><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Site-Engineer</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Phone</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Site</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Block</th><th className="pb-3 text-xs font-semibold text-brand-400 uppercase tracking-wider">state</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Status</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Items</th><th className="pb-3 pl-4 text-xs font-semibold text-brand-400 uppercase tracking-wider">Date</th></tr></thead>
                                <tbody>{filterRequest.map((r: any) => (
                                    <tr key={r.id}>

                                        <td className="py-4 pl-4 text-sm text-brand-600">{r.siteEngineer?.name}</td>
                                        <td className="py-4 pl-4 text-sm text-brand-600">{r.siteEngineer?.phone || '—'}</td>
                                        <td className="py-4 pl-4 text-sm text-brand-600">{r.site?.name || '—'}</td>
                                        <td className="py-4 pl-4 text-sm text-brand-600">{r.block?.name}</td>
                                        <td className="py-4 pl-4 text-sm text-brand-600">{r.block?.district?.name}</td>
                                        <td className="py-4 pl-4 text-sm text-brand-600"><StatusBadge status={r.status} /></td>
                                        <td className="py-4 pl-4 text-sm text-brand-600">{r.items?.length} items</td>
                                        <td className="py-4 pl-4 text-sm text-brand-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : <div className="text-center py-12 text-brand-500"><div className="text-5xl mb-4">📭</div><h3 className="text-base font-bold text-brand-900">{timePeriod !== 'all' ? `No requests ${timePeriod === 'week' ? 'this week' : 'this month'}` : 'No requests yet'}</h3></div>}
                </div>
            </div>


            {/* Inventory */}
            <div className="bg-white border border-brand-200 rounded-xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-brand-200 bg-brand-50/50"><h3 className="text-base font-bold text-brand-900">🏪 Inventory Overview</h3></div>
                <div className="p-6 flex flex-col gap-8">
                    {data.inventories?.map((inv: any) => (
                        <div key={inv.id} className="mb-5 ">
                            <h4 className="text-gray-900 max-w-60 flex items-center justify-center rounded-2xl py-1 mb-3 border font-extrabold border-gray-950">{inv.block?.name} — {inv.block?.district?.name}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {inv.items?.map((item: any) => (
                                    <div key={item.id} className={`inventory-item ${item.quantity <= item.minThreshold ? 'low' : ''}`}>
                                        <div className="text-sm text-brand-500 mb-2 font-medium truncate">{item.materialName}</div>
                                        <div className="text-2xl font-extrabold text-brand-900">{item.quantity}</div>
                                        <div className="text-xs text-brand-400">{item.unit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>





        </>
    )
}