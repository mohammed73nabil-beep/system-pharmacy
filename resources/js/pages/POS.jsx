import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    Printer, 
    CreditCard, 
    Banknote,
    User as UserIcon,
    ShoppingCart,
    ScanBarcode
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function POS() {
    const [cart, setCart] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const barCodeInputRef = useRef(null);

    useEffect(() => {
        fetchMedicines();
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const res = await axios.get('/api/customers');
        setCustomers(res.data);
    };

    const fetchMedicines = async () => {
        const res = await axios.get('/api/medicines');
        setMedicines(res.data);
    };

    const addToCart = (medicine) => {
        const existing = cart.find(item => item.id === medicine.id);
        if (existing) {
            if (existing.quantity >= medicine.quantity) {
                alert('لا توجد كمية كافية في المحزن');
                return;
            }
            setCart(cart.map(item => 
                item.id === medicine.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
            ));
        } else {
            if (medicine.quantity < 1) {
                alert('هذا الصنف قد نفذ');
                return;
            }
            setCart([...cart, { ...medicine, cartQuantity: 1 }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.cartQuantity + delta);
                if (delta > 0 && newQty > item.quantity) return item;
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.selling_price * item.cartQuantity), 0);
    const calculateTotal = () => Math.max(0, calculateSubtotal() - discount);
    const calculateChange = () => Math.max(0, paidAmount - calculateTotal());

    const handleCheckout = useCallback(async () => {
        if (cart.length === 0 || loading) return;
        
        if (paymentMethod === 'credit' && !selectedCustomer) {
            alert('يجب اختيار العميل عند البيع الآجل (الدين)');
            return;
        }

        setLoading(true);
        try {
            let finalPaidAmount = paidAmount;
            if (paymentMethod === 'cash' && paidAmount === 0 && calculateTotal() > 0) {
                finalPaidAmount = calculateTotal();
            }

            const saleData = {
                items: cart.map(item => ({
                    medicine_id: item.id,
                    quantity: item.cartQuantity
                })),
                discount: discount,
                payment_method: paymentMethod,
                paid_amount: finalPaidAmount,
                customer_id: selectedCustomer ? selectedCustomer.id : null,
            };
            await axios.post('/api/sales', saleData);
            
            // Print Receipt
            printReceipt();
            
            alert('تمت عملية البيع بنجاح');
            setCart([]);
            setDiscount(0);
            setPaidAmount(0);
            setSelectedCustomer(null);
            setPaymentMethod('cash');
            fetchMedicines();
        } catch (err) {
            alert(err.response?.data?.error || 'حدث خطأ أثناء إتمام العملية');
        } finally {
            setLoading(false);
        }
    }, [cart, discount, paidAmount, loading, paymentMethod, selectedCustomer]);

    // F12 Global Key Binding
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                handleCheckout();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleCheckout]);

    const filteredMedicines = medicines.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.barcode?.includes(searchTerm)
    ).slice(0, 10);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim() !== '') {
            const term = searchTerm.trim().toLowerCase();
            const exactMatch = medicines.find(m => 
                m.barcode === term || m.name.toLowerCase() === term
            );
            
            if (exactMatch) {
                addToCart(exactMatch);
                setSearchTerm('');
            } else if (filteredMedicines.length === 1) {
                addToCart(filteredMedicines[0]);
                setSearchTerm('');
            }
        }
    };

    const printReceipt = () => {
        if (cart.length === 0) return;
        
        const win = window.open('', '_blank');
        const html = `
            <html dir="rtl">
            <head>
                <title>طباعة الفاتورة</title>
                <style>
                    body { font-family: 'Tahoma', sans-serif; width: 75mm; margin: 0 auto; text-align: center; font-size: 12px; color: #000; }
                    .header { font-weight: bold; font-size: 18px; margin-bottom: 5px; margin-top: 10px; }
                    .sub { font-size: 11px; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    table { width: 100%; text-align: right; border-collapse: collapse; margin-bottom: 10px; }
                    th, td { padding: 4px 0; border-bottom: 1px dashed #eee; font-size: 11px;}
                    .total { border-top: 1px dashed #000; padding-top: 10px; padding-bottom: 10px; font-weight: bold; font-size: 14px; text-align: left; }
                    .footer { text-align: center; font-size: 10px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">صيدلية لورم إيبسوم</div>
                <div class="sub">رقم ضريبي: 300000000000003<br>التاريخ: ${new Date().toLocaleString('ar-EG')}</div>
                <table>
                    <tr>
                        <th style="width: 50%">الصنف</th>
                        <th style="width: 20%">كمية</th>
                        <th style="width: 30%">المجموع</th>
                    </tr>
                    ${cart.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.cartQuantity}</td>
                            <td>${(item.selling_price * item.cartQuantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="total">الإجمالي: ${calculateTotal().toFixed(2)} ر.ي</div>
                <div class="total" style="border-top: none; padding-top: 0; font-size: 12px; color: #555;">طريقة الدفع: ${paymentMethod === 'credit' ? 'آجل (دين)' : 'نقدي'}</div>
                ${paymentMethod === 'credit' ? `<div class="total" style="border-top: none; padding-top: 0; font-size: 12px;">المتبقي (الدين): ${Math.max(0, calculateTotal() - paidAmount).toFixed(2)} ر.ي</div>` : ''}
                <div class="footer">شكراً لزيارتكم!<br>لا يُسمح باسترجاع الأدوية بعد خروجها من الصيدلية حرصاً على الصحة العامة.</div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        win.document.write(html);
        win.document.close();
    };


    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Side: Products Grid */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                    <div className="relative flex-1">
                        <ScanBarcode className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            ref={barCodeInputRef}
                            type="text" 
                            placeholder="امسح الباركود أو ابحث عن دواء... (اضغط Enter للإضافة)" 
                            className="w-full bg-slate-50 border-none rounded-xl pr-12 pl-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                    {filteredMedicines.map(medicine => (
                        <button 
                            key={medicine.id}
                            onClick={() => addToCart(medicine)}
                            disabled={medicine.quantity < 1}
                            className={cn(
                                "p-4 bg-white rounded-2xl border border-slate-100 text-right hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between items-start h-40",
                                medicine.quantity < 1 && "opacity-50 grayscale cursor-not-allowed"
                            )}
                        >
                            <div className="w-full">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-2 inline-block">
                                    {medicine.category?.name || 'عام'}
                                </span>
                                <h4 className="font-bold text-slate-800 line-clamp-2">{medicine.name}</h4>
                            </div>
                            <div className="w-full flex justify-between items-end mt-2">
                                <span className="text-lg font-black text-blue-700">{medicine.selling_price} <small className="text-xs font-normal">ر.ي</small></span>
                                <span className="text-[10px] text-slate-400">مخزون: {medicine.quantity}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Side: Cart & Checkout */}
            <div className="w-96 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">فاتورة بيع</h2>
                    </div>
                </div>

                {/* Payment Method & Customer Selection */}
                <div className="p-4 bg-white border-b border-slate-100 flex flex-col gap-3">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={cn("flex-1 py-1.5 text-sm font-bold rounded-lg transition-all", paymentMethod === 'cash' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            دفع نقدي
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('credit')}
                            className={cn("flex-1 py-1.5 text-sm font-bold rounded-lg transition-all", paymentMethod === 'credit' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            بيع آجل (دين)
                        </button>
                    </div>
                    <select
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer font-medium text-slate-700"
                        value={selectedCustomer?.id || ''}
                        onChange={(e) => {
                            const cId = parseInt(e.target.value);
                            setSelectedCustomer(customers.find(c => c.id === cId) || null);
                        }}
                    >
                        <option value="">-- العميل (نقدي أو إختر عميل للآجل) --</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                            <ShoppingCart className="w-12 h-12" />
                            <p className="font-medium italic">السلة فارغة</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-3 group border border-transparent hover:border-slate-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 ml-2">{item.name}</h4>
                                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
                                        <button 
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 hover:bg-slate-50 rounded text-blue-600"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <span className="w-10 text-center font-bold text-sm">{item.cartQuantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 hover:bg-slate-50 rounded text-rose-500"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-bold text-slate-800">{(item.selling_price * item.cartQuantity).toFixed(2)}</span>
                                        <span className="text-[10px] text-slate-400 mr-1">ر.ي</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Summary & Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 gap-4 flex flex-col">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">المجموع الفرعي</span>
                            <span className="font-bold text-slate-800">{calculateSubtotal().toFixed(2)} ر.ي</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">خصم (ر.ي)</span>
                            <input 
                                type="number" 
                                className="w-20 text-left bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold focus:ring-1 focus:ring-blue-500"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between">
                            <span className="font-black text-slate-800">الإجمالي</span>
                            <span className="font-black text-xl text-blue-700">{calculateTotal().toFixed(2)} ر.ي</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">المبلغ المدفوع</label>
                            <div className="relative">
                                <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="number" 
                                    className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-lg font-black focus:ring-2 focus:ring-emerald-500"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {paidAmount > 0 && paymentMethod === 'cash' && (
                            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <span className="text-emerald-700 text-sm font-bold">المتبقي:</span>
                                <span className="text-emerald-700 font-black">{calculateChange().toFixed(2)} ر.ي</span>
                            </div>
                        )}
                        {paymentMethod === 'credit' && (
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-blue-700 text-sm font-bold">الدين المستحق:</span>
                                <span className="text-blue-700 font-black">{Math.max(0, calculateTotal() - paidAmount).toFixed(2)} ر.ي</span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className={cn(
                            "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-lg",
                            cart.length > 0 && !loading
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        )}
                    >
                        {loading ? "جاري العملية..." : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                إتمام ونقد (F12)
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={printReceipt}
                        disabled={cart.length === 0}
                        className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 py-1 transition-colors text-sm disabled:opacity-50"
                    >
                        <Printer className="w-4 h-4" />
                        طباعة الفاتورة الحالية
                    </button>
                </div>
            </div>
        </div>
    );
}
