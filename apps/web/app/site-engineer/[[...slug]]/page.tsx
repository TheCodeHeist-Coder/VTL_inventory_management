'use client';

import { useState, useEffect, FormEvent, useRef, useMemo } from 'react';
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


{/* contacts lists */ }
function EmergencyContactsBadge({ groups }: {
    groups: { role: string; emoji: string; people: any[]; color: string; border: string }[];
}) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const total = groups.reduce((sum, g) => sum + g.people.length, 0);

    const handleEnter = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
    };
    const handleLeave = () => {
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {/* Badge pill */}
            <div className='border flex gap-2 items-center cursor-pointer shadow-lg shadow-red-200 border-red-600 py-1.5 px-4 rounded-full'>

                Emergency Contacts
                <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800,
                }}>{total}</span>
            </div>

            {/* Popover */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: '0',
                    zIndex: 200, width: '260px',
                    background: '#fff', border: '1.5px solid #fecaca',
                    borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '12px 16px', background: '#fff5f5',
                        borderBottom: '1px solid #fecaca',
                        fontSize: '11px', fontWeight: 800, color: '#dc2626',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}> Emergency Contacts</div>

                    {/* Groups */}
                    {groups.map((g, gi) => (
                        <div key={g.role} style={{
                            borderBottom: gi < groups.length - 1 ? '1px solid #f1f5f9' : 'none',
                        }}>
                            {/* Role section header */}
                            <div style={{
                                padding: '8px 16px 4px',
                                fontSize: '10px', fontWeight: 800,
                                color: g.color, textTransform: 'uppercase', letterSpacing: '0.07em',
                                background: '#fafafa',
                            }}>{g.emoji} {g.role}</div>

                            {g.people.length === 0 ? (
                                <div style={{ padding: '6px 16px 10px', fontSize: '12px', color: '#94a3b8' }}>None assigned</div>
                            ) : g.people.map((p: any, idx: number) => (
                                <div key={p.id} style={{
                                    padding: '8px 16px',
                                    borderTop: idx > 0 ? '1px solid #f8fafc' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{p.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{g.role}</div>
                                    </div>
                                    {p.phone ? (
                                        <a href={`tel:${p.phone}`} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            fontSize: '12px', color: g.color, fontWeight: 700,
                                            textDecoration: 'none', whiteSpace: 'nowrap',
                                            padding: '3px 8px', borderRadius: '6px',
                                            background: `${g.color}12`, border: `1px solid ${g.border}`,
                                        }}>📞 {p.phone}</a>
                                    ) : (
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>No phone</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<Message | null>(null);
    const [user, setUser] = useState<any>({});
    const [mounted, setMounted] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const datePickerRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    // Close date picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) setShowDatePicker(false);
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadData = () => {
        api.get('/siteEngg/dashboard')
            .then(r => {
                setData(r.data);
                setLoading(false);
            }).catch(() => setLoading(false));
    };

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        setMounted(true);
        loadData();
    }, []);

    const markReceived = async (id: number) => {
        try {
            await api.put(`/siteEngg/requests/${id}/received`);
            setMsg({ type: 'success', text: 'Material marked as received!' });
            loadData();
        } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
        setTimeout(() => setMsg(null), 3000);
    };

    // Derive request date counts as a Map for the calendar
    const requestDateMap = useMemo(() => {
        if (!data?.requests) return new Map<string, number>();
        const dates = new Map<string, number>();
        data.requests.forEach((r: any) => {
            const d = new Date(r.createdAt).toLocaleDateString('en-CA');
            dates.set(d, (dates.get(d) || 0) + 1);
        });
        return dates;
    }, [data?.requests]);


    // Months that contain request dates (for prev/next nav dot indicators)
    const requestMonths = useMemo(() => {
        const months = new Set<string>();
        requestDateMap.forEach((_, d) => months.add(d.slice(0, 7))); // YYYY-MM
        return months;
    }, [requestDateMap]);


    // Status counts for filter pills
    const statusCounts = useMemo(() => {
        if (!data?.requests) return {} as Record<string, number>;
        const counts: Record<string, number> = { ALL: data.requests.length };
        data.requests.forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
        return counts;
    }, [data?.requests]);



    // Filtered + sorted requests
    const filteredRequests = useMemo(() => {
        if (!data?.requests) return [];
        let reqs = [...data.requests];
        if (statusFilter !== 'ALL') reqs = reqs.filter((r: any) => r.status === statusFilter);
        if (selectedDate) reqs = reqs.filter((r: any) => new Date(r.createdAt).toLocaleDateString('en-CA') === selectedDate);
        reqs.sort((a: any, b: any) => sortOrder === 'newest'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return reqs;
    }, [data?.requests, statusFilter, selectedDate, sortOrder]);

    const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (selectedDate ? 1 : 0);
    const clearAllFilters = () => { setStatusFilter('ALL'); setSelectedDate(null); };



    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-950 rounded-full animate-spin" />
            </div>
        )
    }
    if (!data) return <div className="p-4 rounded-lg text-sm font-medium mb-5 bg-rose-50 text-rose-700 border border-rose-200">Failed to load</div>;


    const contactGroups = [
        { role: 'Store Manager', emoji: '🏪', people: data.contacts?.storeManagers || [], color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
        { role: 'Block Manager', emoji: '📋', people: data.contacts?.blockManagers || [], color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
        { role: 'District Head', emoji: '🏢', people: data.contacts?.districtHeads || [], color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    ];


    return (
        <>
            <div className="mb-8">
                <div className='flex items-start justify-between flex-wrap gap-4'>

                    <div>
                        <h1 className="text-2xl font-extrabold text-brand-900 tracking-wide mb-1"> Site Engineer Dashboard</h1>
                        <p className='mb-3'>Track and manage your material requests</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {mounted && user.stateName && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{user.stateName}</span>}
                            {data.block?.district?.name && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"> {data.block.district.name}</span>}
                            {data.block?.name && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"> {data.block.name}</span>}
                            {data.site && <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"> {data.site.name}</span>}
                        </div>
                    </div>
                    {/* Contacts badge */}
                    <EmergencyContactsBadge groups={contactGroups} />
                </div>
            </div>
            {msg && <div className={`p-4 rounded-lg text-sm font-medium mb-5 border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-15 mt-13 ">
                {[
                    { icon: <VscGitPullRequestGoToChanges className='w-10 h-10 text-gray-900' />, val: data.stats.total, label: 'Total Requests', cls: 'blue' },
                    { icon: <MdPendingActions className='w-10 h-10 text-gray-900' />, val: data.stats.pending, label: 'Pending', cls: 'amber' },
                    { icon: <FcApproval className='w-10 h-10 text-black' />, val: data.stats.approved, label: 'Approved', cls: 'green' },
                    { icon: <MdMarkChatRead className='w-10 h-10 text-gray-900' />, val: data.stats.fulfilled, label: 'Ready', cls: 'purple' },
                    { icon: <RiUserReceivedFill className='w-10 h-10 text-gray-900' />, val: data.stats.received, label: 'Received', cls: 'cyan' },
                    { icon: <MdFreeCancellation className='w-10 h-10 text-gray-900' />, val: data.stats.rejected, label: 'Rejected', cls: 'rose' },
                ].map(s => (
                    <div key={s.label} className={`stat-bg-white border py-3 px-4 border-gray-300 rounded-xl shadow-xl overflow-hidden ${s.cls}`}>
                        <div className="text-3xl mb-3">{s.icon}</div>
                        <div className="text-lg tracking-wide text-gray-800 font-semibold">{s.label}</div>
                        <div className="text-3xl font-extrabold leading-none mt-1.5 text-brand-900">{s.val}</div>
                    </div>
                ))}
            </div>




            <div className="bg-white border border-gray-300 min-h-84 rounded-xl shadow-xl overflow-hidden">
                {/* Header + Filters — single row */}
                <div className="px-6 py-4 border-b border-gray-300 bg-brand-50/50">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        {/* Left: Title + Status dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 className="text-base font-bold tracking-wide text-gray-900"> My Requests</h3>

                            {/* Status filter dropdown */}
                            {(() => {
                                const statusOptions = [
                                    { key: 'ALL', label: 'All Statuses', icon: '📋', color: '#334155' },
                                    { key: 'PENDING', label: 'Pending', icon: '⏳', color: '#d97706' },
                                    { key: 'APPROVED', label: 'Approved', icon: '✅', color: '#16a34a' },
                                    { key: 'FULFILLED', label: 'Ready', icon: '📦', color: '#7c3aed' },
                                    { key: 'RECEIVED', label: 'Received', icon: '🎉', color: '#0891b2' },
                                    { key: 'REJECTED', label: 'Rejected', icon: '❌', color: '#dc2626' },
                                ];
                                const active = statusOptions.find(o => o.key === statusFilter) || statusOptions[0];
                                return (
                                    <div ref={statusDropdownRef} style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setShowStatusDropdown(p => !p)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                padding: '5px 12px', borderRadius: '8px',
                                                background: statusFilter !== 'ALL' ? `${active!.color}10` : '#f8fafc',
                                                border: `1px solid ${statusFilter !== 'ALL' ? `${active!.color}40` : '#e2e8f0'}`,
                                                fontSize: '12px', fontWeight: 600,
                                                color: statusFilter !== 'ALL' ? active!.color : '#64748b',
                                                cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            {active!.icon} {active!.label}
                                            {statusFilter !== 'ALL' && (
                                                <span style={{
                                                    background: active!.color, color: '#fff',
                                                    fontSize: '10px', fontWeight: 800, borderRadius: '999px',
                                                    padding: '1px 6px',
                                                }}>{statusCounts[statusFilter] || 0}</span>
                                            )}
                                            <span style={{ fontSize: '10px', marginLeft: '2px' }}>▼</span>
                                        </button>
                                        {showStatusDropdown && (
                                            <div style={{
                                                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
                                                background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '6px 0',
                                                minWidth: '180px',
                                            }}>
                                                {statusOptions.map(s => {
                                                    const isActive = statusFilter === s.key;
                                                    const count = statusCounts[s.key] || 0;
                                                    return (
                                                        <button
                                                            key={s.key}
                                                            onClick={() => { setStatusFilter(s.key); setShowStatusDropdown(false); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                width: '100%', padding: '7px 14px', border: 'none', cursor: 'pointer',
                                                                background: isActive ? `${s.color}10` : 'transparent',
                                                                fontSize: '13px', fontWeight: isActive ? 700 : 500,
                                                                color: isActive ? s.color : '#334155',
                                                                transition: 'all 0.1s',
                                                            }}
                                                            onMouseEnter={e => { if (!isActive) (e.target as HTMLElement).style.background = '#f8fafc'; }}
                                                            onMouseLeave={e => { if (!isActive) (e.target as HTMLElement).style.background = 'transparent'; }}
                                                        >
                                                            <span>{s.icon} {s.label}</span>
                                                            <span style={{
                                                                background: isActive ? s.color : '#e2e8f0',
                                                                color: isActive ? '#fff' : '#64748b',
                                                                fontSize: '10px', fontWeight: 800, borderRadius: '999px',
                                                                padding: '1px 7px',
                                                            }}>{count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Right: Sort + Date + Clear */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Sort toggle */}
                            <button
                                onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
                                className='border border-gray-300 py-1.5 text-[12px] text-gray-600 font-bold px-4 rounded-md cursor-pointer bg-gray-50 '
                            >{sortOrder === 'newest' ? '⬇️ Newest' : '⬆️ Oldest'}</button>

                            {/* Date calendar picker */}
                            <div ref={datePickerRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => {
                                        // Auto-navigate to month of selected date or latest request
                                        if (selectedDate) {
                                            const d = new Date(selectedDate + 'T00:00:00');
                                            setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
                                        } else if (requestDateMap.size > 0) {
                                            const latest = Array.from(requestDateMap.keys()).sort().pop()!;
                                            const d = new Date(latest + 'T00:00:00');
                                            setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
                                        }
                                        setShowDatePicker(p => !p);
                                    }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 12px', borderRadius: '8px',
                                        background: selectedDate ? '#eff6ff' : '#f8fafc',
                                        border: `1px solid ${selectedDate ? '#93c5fd' : '#e2e8f0'}`,
                                        fontSize: '12px', fontWeight: 600,
                                        color: selectedDate ? '#2563eb' : '#64748b',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                >
                                    📅 {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date'}
                                    {selectedDate && (
                                        <span onClick={(e) => { e.stopPropagation(); setSelectedDate(null); }} style={{ marginLeft: '2px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</span>
                                    )}
                                </button>
                                {showDatePicker && (() => {
                                    const { year, month } = calendarMonth;
                                    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
                                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                                    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                                    const prevMonth = () => setCalendarMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 });
                                    const nextMonth = () => setCalendarMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 });
                                    const prevMonthKey = month === 0 ? `${year - 1}-12` : `${year}-${String(month).padStart(2, '0')}`;
                                    const nextMonthKey = month === 11 ? `${year + 1}-01` : `${year}-${String(month + 2).padStart(2, '0')}`;

                                    return (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
                                            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '12px',
                                            width: '280px',
                                        }}>
                                            {/* Month navigation */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <button onClick={prevMonth} style={{
                                                    width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                                                    background: requestMonths.has(prevMonthKey) ? '#f1f5f9' : '#fafafa',
                                                    cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: requestMonths.has(prevMonthKey) ? '#334155' : '#cbd5e1',
                                                }}>◀</button>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                                                    {new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                    {requestMonths.has(monthKey) && <span style={{ color: '#2563eb', marginLeft: '4px', fontSize: '8px', verticalAlign: 'super' }}>●</span>}
                                                </div>
                                                <button onClick={nextMonth} style={{
                                                    width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                                                    background: requestMonths.has(nextMonthKey) ? '#f1f5f9' : '#fafafa',
                                                    cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: requestMonths.has(nextMonthKey) ? '#334155' : '#cbd5e1',
                                                }}>▶</button>
                                            </div>

                                            {/* Day headers */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                    <div key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
                                                ))}
                                            </div>

                                            {/* Calendar grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                                                {/* Empty cells for offset */}
                                                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

                                                {/* Day cells */}
                                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                                    const day = i + 1;
                                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                    const count = requestDateMap.get(dateStr) || 0;
                                                    const isSelected = selectedDate === dateStr;
                                                    const hasRequests = count > 0;
                                                    const isToday = dateStr === new Date().toLocaleDateString('en-CA');

                                                    return (
                                                        <button
                                                            key={day}
                                                            onClick={() => {
                                                                if (hasRequests) {
                                                                    setSelectedDate(isSelected ? null : dateStr);
                                                                    setShowDatePicker(false);
                                                                }
                                                            }}
                                                            title={hasRequests ? `${count} request${count > 1 ? 's' : ''}` : ''}
                                                            style={{
                                                                position: 'relative',
                                                                width: '100%', aspectRatio: '1', border: 'none', borderRadius: '8px',
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '12px', fontWeight: isSelected || hasRequests ? 700 : 400,
                                                                cursor: hasRequests ? 'pointer' : 'default',
                                                                background: isSelected ? '#2563eb' : hasRequests ? '#eff6ff' : 'transparent',
                                                                color: isSelected ? '#fff' : hasRequests ? '#1e40af' : isToday ? '#2563eb' : '#64748b',
                                                                outline: isToday && !isSelected ? '1.5px solid #93c5fd' : 'none',
                                                                transition: 'all 0.1s',
                                                            }}
                                                        >
                                                            {day}
                                                            {hasRequests && !isSelected && (
                                                                <span style={{
                                                                    fontSize: '7px', fontWeight: 800, color: '#2563eb',
                                                                    lineHeight: 1, marginTop: '1px',
                                                                }}>{count}</span>
                                                            )}
                                                            {hasRequests && isSelected && (
                                                                <span style={{
                                                                    fontSize: '7px', fontWeight: 800, color: '#bfdbfe',
                                                                    lineHeight: 1, marginTop: '1px',
                                                                }}>{count}</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Quick clear */}
                                            {selectedDate && (
                                                <button
                                                    onClick={() => { setSelectedDate(null); setShowDatePicker(false); }}
                                                    style={{
                                                        width: '100%', marginTop: '8px', padding: '6px', borderRadius: '8px',
                                                        border: '1px solid #e2e8f0', background: '#f8fafc',
                                                        fontSize: '11px', fontWeight: 600, color: '#64748b',
                                                        cursor: 'pointer', textAlign: 'center',
                                                    }}
                                                >Clear date filter</button>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Clear all filters */}
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '5px 12px', borderRadius: '8px',
                                        background: '#fef2f2', border: '1px solid #fecaca',
                                        fontSize: '12px', fontWeight: 600, color: '#dc2626',
                                        cursor: 'pointer',
                                    }}
                                >✕ Clear ({activeFilterCount})</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results summary */}
                {(activeFilterCount > 0) && (
                    <div style={{ padding: '8px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        Showing {filteredRequests.length} of {data.requests?.length || 0} requests
                        {selectedDate && <> from <b>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b></>}
                    </div>
                )}

                {/* Request list */}
                <div className="p-6 flex flex-col gap-8">
                    {filteredRequests.length > 0 ? filteredRequests.map((r: any) => (
                        <div key={r.id} className="bg-gray-50 border border-gray-400  p-3 rounded-xl shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                                <div><div className="text-xs font-semibold text-gray-600 mt-1 mb-1">{new Date(r.createdAt).toLocaleString()}</div></div>
                                <StatusBadge status={r.status} />
                            </div>
                            <div className="flex flex-wrap gap-2 my-3">
                                {r.items?.map((item: any) => <span key={item.id} className="bg-gray-50 border border-gray-400 text-gray-800 px-3 py-1.5 mb-2 rounded-full text-xs font-medium">{item.materialName}: {item.modifiedQuantity ? <><s>{item.quantity}</s> → {item.modifiedQuantity}</> : item.quantity} {item.unit}</span>)}
                            </div>
                            {r.remarks && <div className="text-sm text-brand-500 italic mt-2 bg-brand-50 p-3 rounded-lg border border-gray-300">💬 {r.remarks}</div>}
                            {r.status === 'FULFILLED' && <div className="flex gap-2 mt-4"><button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-sm text-sm" onClick={() => markReceived(r.id)}>✅ Mark as Received</button></div>}
                        </div>
                    )) : (
                        <div className="text-center py-12 text-brand-500">
                            <div className="text-5xl mb-4">{activeFilterCount > 0 ? '🔍' : '📭'}</div>
                            <h3 className="text-base font-bold text-brand-900">{activeFilterCount > 0 ? 'No matching requests' : 'No requests yet'}</h3>
                            {activeFilterCount > 0 && <p className="text-sm mt-2">Try adjusting your filters</p>}
                        </div>
                    )}
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

    if (submitting) return;

    const valid = items.filter(i => i.materialName && i.quantity);

    if (!valid.length) {
        setMsg({ type: 'error', text: 'Add at least one item.' });
        return;
    }

    setSubmitting(true);

    try {

        
        await api.post('/siteEngg/requests', { items: valid, remarks });
        

        setMsg({ type: 'success', text: 'Request submitted! 🎉' });

        setItems([{ materialName: '', quantity: '', unit: 'Bags' }]);
        setRemarks('');

    } catch (err: any) {

        setMsg({
            type: 'error',
            text: err.response?.data?.error || 'Failed'
        });

    } finally {

        setSubmitting(false);
        setTimeout(() => setMsg(null), 4000);

    }
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
                        <button type="button" className="px-8 py-2 border border-brand-200 text-brand-600 rounded-lg cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95 tracking-wide bg-gray-950 text-white font-bold hover:bg-brand-50  mb-6"  onClick={() => setItems([...items, { materialName: '', quantity: '', unit: 'Bags' }])}> Add Item</button>
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">Remarks</label>
                            <textarea className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-lg text-sm text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-900/20 transition-all" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional notes..." />
                        </div>
                       <button
type="submit"
disabled={submitting}
className={`w-96 px-4 py-2 rounded-lg font-medium tracking-wider cursor-pointer transition-all
${submitting ? "bg-gray-500 cursor-not-allowed" : "bg-gray-950 hover:bg-brand-800 hover:scale-105"} text-white`}
>
{submitting ? '⏳ Submitting...' : '📤 Submit Request'}
</button>
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
