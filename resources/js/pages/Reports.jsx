import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    BarChart3, TrendingUp, ShoppingCart, DollarSign, Calendar,
    Download, RefreshCw, ArrowUpRight
} from 'lucide-react';

function KpiCard({ title, value, sub, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> مرتفع
                </span>
            </div>
            <p className="text-slate-500 text-sm">{title}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

const PERIOD_LABELS = { today: 'اليوم', week: 'هذا الأسبوع', month: 'هذا الشهر' };

export default function Reports() {
    const [sales, setSales] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('today');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [salesRes, medsRes] = await Promise.all([
                axios.get('/api/sales'),
                axios.get('/api/medicines'),
            ]);
            setSales(salesRes.data);
            setMedicines(medsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = sales.filter(s => {
        if (!s.created_at) return false;
        const d = new Date(s.created_at);
        if (isNaN(d.getTime())) return false;

        if (period === 'today') {
            const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return dDate.getTime() === startOfToday.getTime();
        }
        if (period === 'week') {
            const startOfWeek = new Date(startOfToday);
            const day = startOfWeek.getDay();
            const diff = day === 6 ? 0 : day + 1; // Start from Saturday
            startOfWeek.setDate(startOfToday.getDate() - diff);
            return d >= startOfWeek;
        }
        if (period === 'month') {
            return d.getMonth() === startOfToday.getMonth() && d.getFullYear() === startOfToday.getFullYear();
        }
        return true;
    });

    const totalRevenue = filtered.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const totalDiscount = filtered.reduce((sum, s) => sum + parseFloat(s.discount || 0), 0);
    const avgSale = filtered.length ? (totalRevenue / filtered.length) : 0;

    // Top selling medicines based on sale_items if available
    const topMeds = medicines
        .sort((a, b) => (b.quantity_sold || 0) - (a.quantity_sold || 0))
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">التقارير والإحصائيات</h2>
                    <p className="text-slate-500 mt-1">تحليل مالي شامل لأداء الصيدلية</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> تحديث
                    </button>
                </div>
            </div>

            {/* Period Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex gap-1 w-fit">
                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setPeriod(key)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${period === key ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard title={`الإيرادات (${PERIOD_LABELS[period]})`} value={`${totalRevenue.toFixed(2)} ر.ي`} icon={DollarSign} color="blue" />
                <KpiCard title="عدد الفواتير" value={filtered.length} sub="فاتورة مكتملة" icon={ShoppingCart} color="indigo" />
                <KpiCard title="متوسط قيمة الفاتورة" value={`${avgSale.toFixed(2)} ر.ي`} icon={TrendingUp} color="emerald" />
                <KpiCard title="إجمالي الخصومات" value={`${totalDiscount.toFixed(2)} ر.ي`} icon={BarChart3} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">آخر المبيعات</h3>
                        <span className="text-sm text-slate-400">{filtered.length} فاتورة</span>
                    </div>
                    <div className="overflow-auto max-h-80">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400">جاري التحميل...</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">لا توجد مبيعات في هذه الفترة</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500">#</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500">التاريخ</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500">الإجمالي</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold text-slate-500">الخصم</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.slice(0, 20).map(s => (
                                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="px-5 py-3 text-sm font-bold text-slate-800">#{s.id}</td>
                                            <td className="px-5 py-3 text-sm text-slate-600">{new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-emerald-600">{parseFloat(s.total).toFixed(2)} ر.ي</td>
                                            <td className="px-5 py-3 text-sm text-slate-500">{parseFloat(s.discount || 0).toFixed(2)} ر.ي</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Stock Summary */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">حالة المخزون</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {loading ? (
                            <div className="text-center text-slate-400">جاري التحميل...</div>
                        ) : medicines.slice(0, 6).map(med => {
                            const pct = Math.min(100, Math.round((med.quantity / Math.max(med.min_quantity * 3, 1)) * 100));
                            const color = pct < 33 ? 'bg-rose-500' : pct < 66 ? 'bg-amber-400' : 'bg-emerald-500';
                            return (
                                <div key={med.id}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700">{med.name}</span>
                                        <span className="text-sm text-slate-500">{med.quantity} وحدة</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
