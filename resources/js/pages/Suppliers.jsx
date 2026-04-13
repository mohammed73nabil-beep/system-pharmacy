import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Truck, Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin, User, Building2
} from 'lucide-react';
import { cn } from '../utils/cn';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
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

const initialForm = { name: '', phone: '', email: '', address: '', contact_person: '' };

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try { const res = await axios.get('/api/suppliers'); setSuppliers(res.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

    const openAdd = () => { setForm(initialForm); setEditId(null); setModal('add'); };
    const openEdit = (s) => { setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', contact_person: s.contact_person || '' }); setEditId(s.id); setModal('edit'); };
    const closeModal = () => { setModal(null); setForm(initialForm); setEditId(null); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (modal === 'add') await axios.post('/api/suppliers', form);
            else await axios.put(`/api/suppliers/${editId}`, form);
            await fetchSuppliers();
            closeModal();
        } catch (e) { alert(e.response?.data?.message || 'حدث خطأ'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try { await axios.delete(`/api/suppliers/${id}`); await fetchSuppliers(); }
        catch (e) { alert('فشل الحذف'); }
    };

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || '').includes(search)
    );

    const COLORS = ['from-purple-500 to-violet-600', 'from-teal-500 to-emerald-600', 'from-orange-500 to-amber-600', 'from-pink-500 to-rose-600', 'from-blue-500 to-indigo-600'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">إدارة الموردين</h2>
                    <p className="text-slate-500 mt-1">{suppliers.length} مورد مسجل</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200">
                    <Plus className="w-4 h-4" /> إضافة مورد
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ابحث عن مورد..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 text-slate-400">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Truck className="w-12 h-12 opacity-50" />
                    <p>لا يوجد موردون</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((s, i) => (
                        <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all group">
                            <div className={cn("h-2 bg-gradient-to-r", COLORS[i % COLORS.length])} />
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg", COLORS[i % COLORS.length])}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{s.name}</h4>
                                            {s.contact_person && <p className="text-xs text-slate-400 mt-0.5">تواصل: {s.contact_person}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {s.phone && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /><span dir="ltr">{s.phone}</span></div>}
                                    {s.email && <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{s.email}</span></div>}
                                    {s.address && <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-3.5 h-3.5 text-slate-400" /><span className="line-clamp-1">{s.address}</span></div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <Modal title={modal === 'add' ? 'إضافة مورد جديد' : 'تعديل بيانات المورد'} onClose={closeModal}>
                    <div className="space-y-4">
                        {[
                            { key: 'name', label: 'اسم الشركة / المورد', icon: Building2, type: 'text', required: true },
                            { key: 'contact_person', label: 'مسؤول التواصل', icon: User, type: 'text' },
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
        </div>
    );
}
