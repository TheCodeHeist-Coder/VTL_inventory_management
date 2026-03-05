'use client'

import { useEffect, useState } from "react"
import api from "../../api";
import { create } from "domain";

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
        .then(r => {setData(r.data);  setLoading(false)})
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

    if(loading){
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }

    if(!data){
        return (
            <div className="p-4 rounded-lg text-sm font-medium mb-5 bg-rose-50 text-rose-700 border border-rose-200">Failed to load dashboard</div>
        )
    }

    const now = new Date();

    const filterRequest = (data.recentRequests || []).filter((r: any) => {
        if(timePeriod === 'all') return true;
        const created = new Date(r.createdAt);
        if(timePeriod === 'weak') {
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

       </>
    )
}