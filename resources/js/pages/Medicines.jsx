import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    X,
    Pill,
    BarChart,
    Calendar,
    DollarSign,
    Box,
    Truck,
    Tag
} from 'lucide-react';
import { cn } from '../utils/cn';

function Modal({ title, onClose, children, maxWidth = "max-w-md" }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className={cn("bg-white rounded-2xl shadow-2xl w-full my-8", maxWidth)}>
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

const initialForm = {
    name: '',
    name_ar: '',
    barcode: '',
    category_id: '',
    supplier_id: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    min_quantity: '',
    expiry_date: '',
};

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [medsRes, catsRes, supsRes] = await Promise.all([
                axios.get('/api/medicines'),
                axios.get('/api/categories'),
                axios.get('/api/suppliers')
            ]);
            setMedicines(medsRes.data);
            setCategories(catsRes.data);
            setSuppliers(supsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openAdd = () => {
        setForm(initialForm);
        setEditId(null);
        setModal('add');
    };

    const openEdit = (med) => {
        setForm({
            name: med.name,
            name_ar: med.name_ar || '',
            barcode: med.barcode || '',
            category_id: med.category_id || '',
            supplier_id: med.supplier_id || '',
            purchase_price: med.purchase_price,
            selling_price: med.selling_price,
            quantity: med.quantity,
            min_quantity: med.min_quantity || '',
            expiry_date: med.expiry_date || '',
        });
        setEditId(med.id);
        setModal('edit');
    };

    const closeModal = () => {
        setModal(null);
        setForm(initialForm);
        setEditId(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (modal === 'add') {
                await axios.post('/api/medicines', form);
                alert('تمت إضافة الدواء بنجاح');
            } else {
                await axios.put(`/api/medicines/${editId}`, form);
                alert('تم تحديث بيانات الدواء بنجاح');
            }
            fetchData();
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
        try {
            await axios.delete(`/api/medicines/${id}`);
            fetchData();
        } catch (err) {
            alert('حدث خطأ أثناء حذف الدواء');
        }
    };

    const filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        med.barcode?.includes(searchTerm) ||
        med.name_ar?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">إدارة الأدوية</h2>
                    <p className="text-slate-500 mt-1">عرض وتعديل مخزون الأدوية في الصيدلية</p>
                </div>
                <button 
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5" />
                    إضافة دواء جديد
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو الباركود..." 
                        className="w-full bg-slate-50 border-none rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
                    <Filter className="w-4 h-4" />
                    <span>تصفية</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">اسم الدواء</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">الفئة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">سعر البيع</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">الكمية</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">تاريخ الانتهاء</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">عمليات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(n => (
                                    <tr key={n} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4 h-16 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                                        لا توجد أدوية مطابقة للبحث
                                    </td>
                                </tr>
                            ) : (
                                filteredMedicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-800">{med.name}</p>
                                                {med.name_ar && <p className="text-xs text-slate-400 mt-1">{med.name_ar}</p>}
                                                <p className="text-[10px] text-slate-400 font-mono mt-1">{med.barcode || 'بدون باركود'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                                {med.category?.name || 'غير مصنف'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            {med.selling_price} ر.ي
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-black",
                                                    med.quantity <= (med.min_quantity || 10) ? "text-rose-500" : "text-slate-800"
                                                )}>
                                                    {med.quantity}
                                                </span>
                                                {med.quantity <= (med.min_quantity || 10) && (
                                                    <AlertCircle className="w-4 h-4 text-rose-500" title="كمية منخفضة" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {med.expiry_date || 'غير محدد'}
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEdit(med)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(med.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Addition/Edit Modal */}
            {modal && (
                <Modal 
                    title={modal === 'add' ? 'إضافة دواء جديد' : 'تعديل بيانات الدواء'} 
                    onClose={closeModal}
                    maxWidth="max-w-3xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Pill className="w-4 h-4" /> اسم الدواء (EN) <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    placeholder="مثلاً: Panadol Extra"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> اسم الدواء (AR)
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.name_ar}
                                    onChange={(e) => setForm({...form, name_ar: e.target.value})}
                                    placeholder="مثلاً: بانادول اكسترا"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <BarChart className="w-4 h-4" /> الباركود
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    value={form.barcode}
                                    onChange={(e) => setForm({...form, barcode: e.target.value})}
                                    placeholder="امسح الباركود..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">الفئة</label>
                                    <select 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                        value={form.category_id}
                                        onChange={(e) => setForm({...form, category_id: e.target.value})}
                                    >
                                        <option value="">اختر الفئة</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 font-bold">المورد</label>
                                    <select 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white font-bold"
                                        value={form.supplier_id}
                                        onChange={(e) => setForm({...form, supplier_id: e.target.value})}
                                    >
                                        <option value="">اختر المورد</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> سعر الشراء <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={form.purchase_price}
                                        onChange={(e) => setForm({...form, purchase_price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2 font-black text-blue-600">
                                        <DollarSign className="w-4 h-4" /> سعر البيع <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600"
                                        value={form.selling_price}
                                        onChange={(e) => setForm({...form, selling_price: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Box className="w-4 h-4" /> الكمية الحالية <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={form.quantity}
                                        onChange={(e) => setForm({...form, quantity: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 ml-1" /> حد الأمان
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={form.min_quantity}
                                        onChange={(e) => setForm({...form, min_quantity: e.target.value})}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 ml-1" /> تاريخ الانتهاء
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.expiry_date}
                                    onChange={(e) => setForm({...form, expiry_date: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button 
                                    onClick={handleSave}
                                    disabled={saving || !form.name || !form.selling_price || !form.quantity}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                                >
                                    {saving ? 'جاري الحفظ...' : (modal === 'add' ? 'إضافة الدواء' : 'تحديث البيانات')}
                                </button>
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
