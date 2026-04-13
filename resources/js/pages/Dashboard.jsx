import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    TrendingUp, Pill as PillIcon, AlertTriangle, Calendar,
    ArrowUpRight, ClipboardList, Users, ShoppingBag, ChevronLeft,
    BarChart3
} from 'lucide-react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass, to }) => {
    const content = (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all group h-full">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {to && <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-black text-slate-800">{value}</p>
        </div>
    );
    return to ? <Link to={to} className="block">{content}</Link> : content;
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_medicines: 0, low_stock: 0, expired: 0,
        total_sales_today: 0, total_orders_today: 0, total_customers: 0,
        sales_chart: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/dashboard-stats')
            .then(res => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const todayAr = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatChartDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">نظرة عامة على الصيدلية</h2>
                    <p className="text-slate-500 mt-1">مرحباً بك، إليك ملخص نشاط اليوم</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-slate-600">{todayAr}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                    title="مبيعات اليوم"
                    value={loading ? '...' : `${stats.total_sales_today?.toFixed(2)} ر.ي`}
                    icon={TrendingUp}
                    colorClass="bg-blue-50 text-blue-600"
                    to="/reports"
                />
                <StatCard
                    title="طلبات اليوم"
                    value={loading ? '...' : stats.total_orders_today}
                    icon={ShoppingBag}
                    colorClass="bg-indigo-50 text-indigo-600"
                    to="/pos"
                />
                <StatCard
                    title="إجمالي الأدوية"
                    value={loading ? '...' : stats.total_medicines}
                    icon={PillIcon}
                    colorClass="bg-violet-50 text-violet-600"
                    to="/medicines"
                />
                <StatCard
                    title="أصناف منخفضة المخزون"
                    value={loading ? '...' : stats.low_stock}
                    icon={ClipboardList}
                    colorClass="bg-amber-50 text-amber-600"
                    to="/inventory"
                />
                <StatCard
                    title="أدوية منتهية الصلاحية"
                    value={loading ? '...' : stats.expired}
                    icon={AlertTriangle}
                    colorClass="bg-rose-50 text-rose-600"
                    to="/inventory"
                />
                <StatCard
                    title="إجمالي العملاء"
                    value={loading ? '...' : stats.total_customers}
                    icon={Users}
                    colorClass="bg-emerald-50 text-emerald-600"
                    to="/customers"
                />
            </div>

            {/* Charts & Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            مبيعات آخر 7 أيام
                        </h3>
                    </div>
                    <div className="h-72 w-full" dir="ltr">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">جاري تحميل البيانات...</div>
                        ) : stats.sales_chart?.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">لا توجد بيانات مبيعات كافية مؤخراً</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.sales_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatChartDate} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${parseFloat(value).toFixed(2)} ر.ي`, 'الإيرادات']}
                                        labelFormatter={formatChartDate}
                                    />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Quick Actions Desktop */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-200 flex flex-col justify-center relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">هل تريد إجراء عملية بيع؟</h3>
                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                            نظام نقطة البيع مجهز للسرعة! يدعم قوارئ الباركود واختصارات لوحة المفاتيح لإتمام المبيعات بثوانٍ معدودة.
                        </p>
                        <Link
                            to="/pos"
                            className="inline-flex w-full justify-center items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-black hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            فتح نقطة البيع (POS)
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Alerts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        تنبيهات المخزون
                    </h3>
                    {stats.low_stock > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                <p className="text-sm text-amber-800 font-medium">
                                    يوجد <span className="font-black">{stats.low_stock}</span> صنف دواء تحت الحد الأدنى للمخزون
                                </p>
                            </div>
                            <Link to="/inventory" className="block text-center text-sm text-blue-600 hover:underline font-medium pt-2">
                                عرض تفاصيل المخزون ←
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-sm text-emerald-700 font-medium">جميع الأصناف في مستوى جيد ✓</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-rose-500" />
                        تنبيهات الصلاحية
                    </h3>
                    {stats.expired > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                                <p className="text-sm text-rose-800 font-medium">
                                    يوجد <span className="font-black">{stats.expired}</span> دواء منتهي الصلاحية يجب إزالته
                                </p>
                            </div>
                            <Link to="/inventory" className="block text-center text-sm text-blue-600 hover:underline font-medium pt-2">
                                مراجعة الأدوية المنتهية ←
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-sm text-emerald-700 font-medium">لا توجد أدوية منتهية الصلاحية ✓</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
