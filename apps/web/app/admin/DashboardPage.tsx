'use client'

import { useEffect, useState } from "react"
import api from "../../api";
import { RiArrowDropDownLine } from "react-icons/ri";

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
                        <div>
                            <select className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 transition-all cursor-pointer appearance-none" value={filterState} onChange={e => handleStateFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                                <option value="">All States <RiArrowDropDownLine className="w-9 h-9 text-gray-950" /> </option>
                                {states.map((s: any) => <option key={s.id} value={s.id}>🏛️ {s.name}</option>)}
                            </select>
                        </div>
                        {filterState && <button className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-md text-xs font-medium hover:bg-brand-50 transition-colors cursor-pointer hover:bg-gray-100" onClick={() => handleStateFilter('')}>✕ Clear</button>}
                        {filterState && <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 500 }}>📊 Showing stats for: {states.find((s: any) => s.id === parseInt(filterState))?.name}</span>}
                    </div>
                </div>
            </div>


            {/* stats Cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

                 {[
                    { icon: '🏠️', val: data.stats.states, label: 'States', bg: 'linear-gradient(135deg, #7c3aed22, #7c3aed11)' },
                    { icon: '🏢', val: data.stats.districts, label: 'Districts' },
                    { icon: '📋', val: data.stats.blocks, label: 'Blocks' },
                    { icon: '🏗️', val: data.stats.sites || 0, label: 'Sites' },
                    { icon: '👥', val: data.stats.users, label: 'Active Users' },
                    { icon: '📦', val: data.stats.totalRequests, label: 'Total Requests' },
                ].map(s => (
                    <div className="stat-bg-white border border-brand-200 rounded-xl shadow-sm overflow-hidden" >
                     <div className="text-3xl mb-3">{s.icon}</div>
                        <div className="text-3xl font-extrabold leading-none mb-1 text-brand-900">{s.val}</div>
                        <div className="text-sm text-brand-500 font-medium">{s.label}</div>
                    </div>
                ))}

            </div>


        </>
    )
}