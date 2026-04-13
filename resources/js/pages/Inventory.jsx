import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Package, AlertTriangle, Search, Filter, ChevronDown, RefreshCw,
    TrendingDown, Calendar, Pill
} from 'lucide-react';
import { cn } from '../utils/cn';

const STATUS_CONFIG = {
    expired:  { label: 'منتهية الصلاحية', color: 'rose',  bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
    low:      { label: 'مخزون منخفض',    color: 'amber',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
    ok:       { label: 'جيد',             color: 'emerald',bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200' },
};

function getStatus(medicine) {
    if (medicine.expiry_date && new Date(medicine.expiry_date) < new Date()) return 'expired';
    if (medicine.quantity <= medicine.min_quantity) return 'low';
    return 'ok';
}

export default function Inventory() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | low | expired

    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/medicines');
            setMedicines(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

    const filtered = medicines
        .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.name_ar || '').includes(search))
        .filter(m => {
            if (filter === 'low') return m.quantity <= m.min_quantity;
            if (filter === 'expired') return m.expiry_date && new Date(m.expiry_date) < new Date();
            return true;
        });

    const lowCount = medicines.filter(m => m.quantity <= m.min_quantity && !(m.expiry_date && new Date(m.expiry_date) < new Date())).length;
    const expiredCount = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) < new Date()).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">إدارة المخزون</h2>
                    <p className="text-slate-500 mt-1">تتبع مستويات المخزون والأدوية</p>
                </div>
                <button onClick={fetchMedicines} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> تحديث
                </button>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center">
                    <div className="p-3 bg-slate-50 rounded-xl"><Package className="w-6 h-6 text-slate-500" /></div>
                    <div><p className="text-slate-500 text-sm">إجمالي الأصناف</p><p className="text-2xl font-black text-slate-800">{medicines.length}</p></div>
                </div>
                <div onClick={() => setFilter(filter === 'low' ? 'all' : 'low')} className={cn("p-5 rounded-2xl border shadow-sm flex gap-4 items-center cursor-pointer transition-all", filter === 'low' ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-amber-200 hover:border-amber-400')}>
                    <div className={cn("p-3 rounded-xl", filter === 'low' ? 'bg-amber-500' : 'bg-amber-50')}><TrendingDown className={cn("w-6 h-6", filter === 'low' ? 'text-white' : 'text-amber-600')} /></div>
                    <div>
                        <p className={cn("text-sm", filter === 'low' ? 'text-amber-100' : 'text-amber-700')}>مخزون منخفض</p>
                        <p className={cn("text-2xl font-black", filter === 'low' ? 'text-white' : 'text-amber-700')}>{lowCount}</p>
                    </div>
                </div>
                <div onClick={() => setFilter(filter === 'expired' ? 'all' : 'expired')} className={cn("p-5 rounded-2xl border shadow-sm flex gap-4 items-center cursor-pointer transition-all", filter === 'expired' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-rose-200 hover:border-rose-400')}>
                    <div className={cn("p-3 rounded-xl", filter === 'expired' ? 'bg-rose-500' : 'bg-rose-50')}><AlertTriangle className={cn("w-6 h-6", filter === 'expired' ? 'text-white' : 'text-rose-600')} /></div>
                    <div>
                        <p className={cn("text-sm", filter === 'expired' ? 'text-rose-100' : 'text-rose-700')}>منتهية الصلاحية</p>
                        <p className={cn("text-2xl font-black", filter === 'expired' ? 'text-white' : 'text-rose-700')}>{expiredCount}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ابحث عن دواء..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-right px-6 py-4 text-sm font-bold text-slate-600">الدواء</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-slate-600">التصنيف</th>
                                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">الكمية</th>
                                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">الحد الأدنى</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-slate-600">تاريخ الانتهاء</th>
                                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-16 text-slate-400">جاري التحميل...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16 text-slate-400">لا توجد نتائج</td></tr>
                            ) : filtered.map(med => {
                                const status = getStatus(med);
                                const cfg = STATUS_CONFIG[status];
                                const daysToExpiry = med.expiry_date ? Math.ceil((new Date(med.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                                return (
                                    <tr key={med.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Pill className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{med.name}</p>
                                                    {med.name_ar && <p className="text-xs text-slate-400">{med.name_ar}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{med.category?.name || '—'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn("text-lg font-black", med.quantity <= med.min_quantity ? 'text-amber-600' : 'text-slate-800')}>{med.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-500">{med.min_quantity}</td>
                                        <td className="px-6 py-4">
                                            {med.expiry_date ? (
                                                <div>
                                                    <p className="text-sm text-slate-700">{med.expiry_date}</p>
                                                    {daysToExpiry !== null && daysToExpiry <= 90 && (
                                                        <p className={cn("text-xs mt-0.5", daysToExpiry < 0 ? 'text-rose-500' : 'text-amber-500')}>
                                                            {daysToExpiry < 0 ? `منتهي منذ ${Math.abs(daysToExpiry)} يوم` : `ينتهي خلال ${daysToExpiry} يوم`}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full border", cfg.bg, cfg.text, cfg.border)}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
