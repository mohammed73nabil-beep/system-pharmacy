import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users, Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, User, History, Wallet, CheckCircle, Receipt
} from 'lucide-react';
import { cn } from '../utils/cn';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={cn("bg-white rounded-2xl shadow-2xl w-full", title === 'سجل الديون' ? 'max-w-2xl' : 'max-w-md')}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

const initialForm = { name: '', phone: '', email: '', address: '' };

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Debt System States
    const [debtHistory, setDebtHistory] = useState([]);
    const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try { const res = await axios.get('/api/customers'); setCustomers(res.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const openAdd = () => { setForm(initialForm); setEditId(null); setModal('add'); };
    const openEdit = (c) => { setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '' }); setEditId(c.id); setModal('edit'); };
    const closeModal = () => { setModal(null); setForm(initialForm); setEditId(null); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (modal === 'add') await axios.post('/api/customers', form);
            else await axios.put(`/api/customers/${editId}`, form);
            await fetchCustomers();
            closeModal();
        } catch (e) { alert(e.response?.data?.message || 'حدث خطأ'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try { await axios.delete(`/api/customers/${id}`); await fetchCustomers(); }
        catch (e) { alert('فشل الحذف'); }
    };

    const fetchDebtHistory = async (customer) => {
        setLoading(true);
        setSelectedCustomerForDebt(customer);
        try {
            const res = await axios.get(`/api/debts?customer_id=${customer.id}`);
            setDebtHistory(res.data);
            setModal('debt_history');
        } catch (e) { alert('فشل جلب السجل'); }
        finally { setLoading(false); }
    };

    const handlePayment = async () => {
        if (!paymentAmount || paymentAmount <= 0) return alert('الرجاء إدخال مبلغ صحيح');
        setSaving(true);
        try {
            await axios.post('/api/debts/payment', {
                customer_id: selectedCustomerForDebt.id,
                amount: paymentAmount,
                notes: paymentNotes
            });
            await fetchCustomers();
            closeModal();
            alert('تم تسجيل عملية التسديد بنجاح');
        } catch (e) { alert(e.response?.data?.message || 'فشل التسديد'); }
        finally { setSaving(false); }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">إدارة العملاء</h2>
                    <p className="text-slate-500 mt-1">{customers.length} عميل مسجل</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200">
                    <Plus className="w-4 h-4" /> إضافة عميل
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Users className="w-12 h-12 opacity-50" />
                    <p>لا يوجد عملاء</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{c.name}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">عميل</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {c.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span dir="ltr">{c.phone}</span>
                                    </div>
                                )}
                                {c.email && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{c.email}</span>
                                    </div>
                                )}
                                {c.address && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="line-clamp-1">{c.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Debt Stats */}
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">الرصيد المستحق</p>
                                    <p className={cn("font-black text-lg", parseFloat(c.balance) > 0 ? "text-rose-600" : "text-emerald-600")}>
                                        {parseFloat(c.balance).toFixed(2)} <small className="text-xs font-normal">ر.ي</small>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => fetchDebtHistory(c)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
                                        title="سجل الديون"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => { setSelectedCustomerForDebt(c); setPaymentAmount(''); setPaymentNotes(''); setModal('pay_debt'); }}
                                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                                        title="تسديد دين"
                                    >
                                        <Wallet className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <Modal title={modal === 'add' ? 'إضافة عميل جديد' : 'تعديل بيانات العميل'} onClose={closeModal}>
                    <div className="space-y-4">
                        {[
                            { key: 'name', label: 'الاسم', icon: User, type: 'text', required: true },
                            { key: 'phone', label: 'رقم الهاتف', icon: Phone, type: 'tel' },
                            { key: 'email', label: 'البريد الإلكتروني', icon: Mail, type: 'email' },
                            { key: 'address', label: 'العنوان', icon: MapPin, type: 'text' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">{f.label} {f.required && <span className="text-rose-500">*</span>}</label>
                                <div className="relative">
                                    <f.icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={f.type}
                                        value={form[f.key]}
                                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={f.label}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                                {saving ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                            <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">إلغاء</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Debt History Modal */}
            {modal === 'debt_history' && (
                <Modal title="سجل الديون" onClose={closeModal}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <div>
                                <h4 className="font-bold text-blue-900">{selectedCustomerForDebt?.name}</h4>
                                <p className="text-xs text-blue-700">تتبع كافة الحركات المالية لهذا العميل</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">الرصيد الحالي</p>
                                <p className="font-black text-xl text-blue-900">{parseFloat(selectedCustomerForDebt?.balance).toFixed(2)} ر.ي</p>
                            </div>
                        </div>

                        <div className="h-96 overflow-y-auto space-y-2 pr-2">
                            {debtHistory.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400">لا يوجد سجل حركات للعميل</div>
                            ) : (
                                debtHistory.map(record => (
                                    <div key={record.id} className="p-4 rounded-xl border border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", record.type === 'debt' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                                                {record.type === 'debt' ? <Receipt className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{record.type === 'debt' ? 'دين جديد' : 'عملية تسديد'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{new Date(record.created_at).toLocaleString('ar-EG')}</p>
                                                {record.notes && <p className="text-xs text-slate-500 mt-1">{record.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="text-left font-black text-sm">
                                            {record.type === 'debt' ? '+' : '-'} {parseFloat(record.amount).toFixed(2)} ر.ي
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Pay Debt Modal */}
            {modal === 'pay_debt' && (
                <Modal title="تسديد دين" onClose={closeModal}>
                    <div className="space-y-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4">
                            <p className="text-xs text-emerald-700 font-bold mb-1 uppercase">إجمالي الدين الحالي</p>
                            <p className="text-2xl font-black text-emerald-800">{parseFloat(selectedCustomerForDebt?.balance).toFixed(2)} ر.ي</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">المبلغ المدفوع (ر.ي)</label>
                            <div className="relative">
                                <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-lg font-black focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">ملاحظات (اختياري)</label>
                            <textarea
                                value={paymentNotes}
                                onChange={e => setPaymentNotes(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                placeholder="أدخل أي ملاحظات عن هذه الدفعة..."
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={handlePayment} disabled={saving || !paymentAmount} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-100">
                                {saving ? 'جاري الحفظ...' : 'تأكيد عملية التسديد'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
