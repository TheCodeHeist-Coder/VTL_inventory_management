'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavItem } from '../types';

const roleConfig: Record<string, { label: string; icon: string; color: string }> = {
    ADMIN: { label: 'Administrator', icon: '⚙️', color: '#6366f1' },
    STATE_HEAD: { label: 'State Head', icon: '🏛️', color: '#a855f7' },
    DISTRICT_HEAD: { label: 'District Head', icon: '🏢', color: '#06b6d4' },
    BLOCK_MANAGER: { label: 'Block Manager', icon: '📋', color: '#f59e0b' },
    STORE_MANAGER: { label: 'Store Manager', icon: '🏪', color: '#10b981' },
    SITE_ENGINEER: { label: 'Site Engineer', icon: '👷', color: '#f43f5e' },
};

interface LayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
}

export default function Layout({ children, navItems }: LayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    const user = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user') || '{}')
        : {};
    const config = roleConfig[user.role] || {};

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const initials = user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??';

    return (
        <div className="flex  min-h-screen bg-brand-50 text-brand-900 font">
            <aside className="w-[260px]  border-r border-brand-200 p-6 flex flex-col fixed inset-y-0 z-50 transition-all shadow-sm">
                <div className="flex items-center gap-3 px-2 pb-6 border-b border-brand-200 mb-6">
                    
                    <div>
                        <div className="text-md shadow-xl text-[#337ab7] border border-blue-600  uppercase tracking-wider font-bold  px-4 py-1.5 rounded-full inline-block mt-1 bg-brand-50">
                            {config.label}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-1">
                    {navItems.map((item, i) => {
                        const isActive = item.exact
                            ? pathname === item.path
                            : pathname.startsWith(item.path);

                        return (
                            <Link key={i} href={item.path}
                                className={`flex items-center gap-3 px-5 py-2.5 rounded-md text-md font-semibold tracking-widest transition-all w-full text-left ${isActive
                                    ? 'bg-gray-950 text-white shadow-white shadow-2xl '
                                    : 'text-gray-950 font-semibold tracking-widest hover:bg-gray-200 hover:text-brand-900'
                                    }`}>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className="mt-auto" />
                    <button onClick={handleLogout}
                        className="flex items-center justify-center border border-rose-500 bg-rose-50 cursor-pointer gap-3 px-3.5 py-2.5 rounded-lg text-md font-medium transition-all w-full text-left tracking-wider hover:bg-rose-50 hover:text-rose-600 mt-2">
                        <span>Logout</span>
                    </button>
                </nav>

                <div className="px-2 pt-4 pb-4 border-t border-brand-200  mt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-950 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                            {initials}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-semibold tracking-wide text-gray-950 leading-tight truncate">{user.name}</div>
                            <div className="text-xs tracking-wide text-brand-500 truncate">{user.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 ml-[260px] p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
}
