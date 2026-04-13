import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Pill, 
    ShoppingCart, 
    Package, 
    Users, 
    Truck, 
    BarChart3, 
    Settings,
    LogOut,
    Bell,
    Search
} from 'lucide-react';
import { cn } from '../utils/cn'; // I'll create this utility in the next step
import axios from 'axios';

const SidebarLink = ({ to, icon: Icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50" 
                    : "text-slate-600 hover:bg-slate-100"
            )}
        >
            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
            <span className="font-medium">{children}</span>
        </Link>
    );
};

export default function MainLayout({ onLogout }) {
    const [pharmacyName, setPharmacyName] = useState('صيدلية الأمل');
    const [ownerName, setOwnerName] = useState('هيثم الفقية');

    useEffect(() => {
        axios.get('/api/settings')
            .then(res => {
                if (res.data) {
                    if (res.data.pharmacy_name) setPharmacyName(res.data.pharmacy_name);
                    if (res.data.owner_name) setOwnerName(res.data.owner_name);
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-50 font-['Noto_Kufi_Arabic']">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col fixed h-full right-0 top-0">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Pill className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">{pharmacyName}</h1>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    <SidebarLink to="/" icon={LayoutDashboard}>لوحة القيادة</SidebarLink>
                    <SidebarLink to="/pos" icon={ShoppingCart}>نقطة البيع</SidebarLink>
                    <SidebarLink to="/medicines" icon={Pill}>الأدوية</SidebarLink>
                    <SidebarLink to="/inventory" icon={Package}>المخزون</SidebarLink>
                    <SidebarLink to="/customers" icon={Users}>العملاء</SidebarLink>
                    <SidebarLink to="/suppliers" icon={Truck}>الموردين</SidebarLink>
                    <SidebarLink to="/reports" icon={BarChart3}>التقارير</SidebarLink>
                    <SidebarLink to="/settings" icon={Settings}>الإعدادات</SidebarLink>
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 mr-72">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                    <div className="relative w-96">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="بحث في النظام..." 
                            className="w-full bg-slate-50 border-none rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-800">{ownerName}</p>
                                <p className="text-xs text-slate-500">مدير النظام</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {ownerName ? ownerName.charAt(0) : 'ش'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
