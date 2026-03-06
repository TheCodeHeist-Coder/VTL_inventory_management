'use client';

import { useState, useEffect } from 'react';
import api from '../../../api';

export default function InventoriesPage() {
    const [inventories, setInventories] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterState, setFilterState] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterLowStock, setFilterLowStock] = useState(false);

    useEffect(() => { Promise.all([api.get('/admin/inventories'), api.get('/admin/states'), api.get('/admin/districts')]).then(([inv, st, d]) => { setInventories(inv.data.data || inv.data); setStates(st.data.data || st.data); setDistricts(d.data.data || d.data); setLoading(false); }); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
    const stateDistrictIds = filterState ? districts.filter((d: any) => d.state?.id === (filterState)).map((d: any) => d.id) : null;
    const filteredDists = filterState ? districts.filter((d: any) => d.state?.id === (filterState)) : districts;
    const filtered = inventories.filter(inv => {
        if (filterState && stateDistrictIds && !stateDistrictIds.includes(inv.block?.district?.id)) return false;
        if (filterDistrict && inv.block?.district?.id !== (filterDistrict)) return false;
        if (filterLowStock && !inv.items?.some((item: any) => item.quantity <= item.minThreshold)) return false;
        return true;
    });
    const hasFilters = filterState || filterDistrict || filterLowStock;
    const totalLow = filtered.reduce((sum, inv) => sum + (inv.items?.filter((i: any) => i.quantity <= i.minThreshold)?.length || 0), 0);

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight mb-1">Inventory Management</h1>
                <p>Monitor inventory levels across all blocks</p>
                {totalLow > 0 && <div className="p-4 rounded-lg text-sm font-medium mt-3 bg-amber-50 text-amber-700 border border-amber-200">⚠️ {totalLow} items below minimum threshold</div>}
            </div>

            <div className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6"><div className="p-6" style={{ padding: '16px 24px' }}><div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>🔍 Filter:</span>
                <div style={{ minWidth: '160px' }}><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer appearance-none" value={filterState} onChange={e => { setFilterState(e.target.value); setFilterDistrict(''); }} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All States</option>{states.map(s => <option key={s.id} value={s.id}>🏛️ {s.name}</option>)}</select></div>
                <div style={{ minWidth: '180px' }}><select className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-lg text-sm cursor-pointer appearance-none" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}><option value="">All Districts</option>{filteredDists.map((d: any) => <option key={d.id} value={d.id}>🏢 {d.name}</option>)}</select></div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}><input type="checkbox" checked={filterLowStock} onChange={e => setFilterLowStock(e.target.checked)} style={{ accentColor: '#f59e0b' }} />⚠️ Low Stock Only</label>
                {hasFilters && <button className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-md text-xs" onClick={() => { setFilterState(''); setFilterDistrict(''); setFilterLowStock(false); }}>✕ Clear</button>}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>{filtered.length} inventories</span>
            </div></div></div>

            {filtered.length > 0 ? filtered.map(inv => (
                <div key={inv.id} className="bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-gray-300 flex items-center justify-between bg-brand-50/50">
                        <h3 className="text-base font-bold text-brand-900">📋 {inv.block?.name} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 400 }}>— 🏢 {inv.block?.district?.name}</span></h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">{inv.items?.length || 0} items</span>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {inv.items?.map((item: any) => (
                                <div key={item.id} className={`inventory-item ${item.quantity <= item.minThreshold ? 'low' : ''}`}>
                                    <div className="text-sm text-brand-500 mb-2 font-medium truncate">{item.materialName}</div>
                                    <div className="text-2xl font-extrabold text-brand-900">{item.quantity}</div>
                                    <div className="text-xs text-brand-400">{item.unit} — min: {item.minThreshold}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )) : <div className="text-center py-12 text-brand-500"><div className="text-5xl mb-4">🏪</div><h3 className="text-base font-bold text-brand-900">{hasFilters ? 'No inventories match filters' : 'No inventories'}</h3></div>}
        </>
    );
}
