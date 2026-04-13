import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, Bell, Shield, Palette, Globe, Save, Check, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import axios from 'axios';

const SECTIONS = [
    { id: 'pharmacy', label: 'معلومات الصيدلية', icon: Store },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'appearance', label: 'المظهر', icon: Palette },
];

function FormField({ label, children }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function InputField({ value, onChange, placeholder, type = 'text' }) {
    return (
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative w-12 h-6 rounded-full transition-colors duration-200",
                    checked ? 'bg-blue-600' : 'bg-slate-200'
                )}
            >
                <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                    checked ? 'right-1' : 'left-1'
                )} />
            </button>
        </div>
    );
}

export default function Settings() {
    const [activeSection, setActiveSection] = useState('pharmacy');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        pharmacy_name: 'صيدليتي الذكية',
        owner_name: 'د. أحمد محمد',
        phone: '0555555555',
        address: 'المملكة العربية السعودية',
        license_number: 'PHR-2024-001',
        vat_number: '',
        low_stock_alert: true,
        expiry_alert: true,
        daily_report: false,
        sound_notifications: true,
        require_password: false,
        auto_backup: true,
        theme: 'light',
        font_size: 'medium',
        currency: 'YER',
    });

    useEffect(() => {
        axios.get('/api/settings')
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    // Convert boolean-like strings back to actual booleans
                    const parsedSettings = { ...settings };
                    for (const [key, value] of Object.entries(res.data)) {
                        if (value === 'true' || value === '1') parsedSettings[key] = true;
                        else if (value === 'false' || value === '0') parsedSettings[key] = false;
                        else parsedSettings[key] = value;
                    }
                    setSettings(parsedSettings);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/settings', settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save settings:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">الإعدادات</h2>
                    <p className="text-slate-500 mt-1">إدارة إعدادات وتفضيلات النظام</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-white disabled:opacity-75",
                        saved ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    )}
                >
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : 
                     saved ? <><Check className="w-4 h-4" /> تم الحفظ</> : 
                     <><Save className="w-4 h-4" /> حفظ التغييرات</>}
                </button>
            </div>

            <div className="flex gap-6 items-start">
                {/* Sidebar */}
                <div className="w-56 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex-shrink-0">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-right mb-1",
                                activeSection === s.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            <s.icon className={cn("w-4 h-4", activeSection === s.id ? 'text-white' : 'text-slate-400')} />
                            <span className="text-sm font-medium">{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    {activeSection === 'pharmacy' && (
                        <div className="space-y-5">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">معلومات الصيدلية</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="اسم الصيدلية">
                                    <InputField value={settings.pharmacy_name} onChange={e => update('pharmacy_name', e.target.value)} placeholder="اسم الصيدلية" />
                                </FormField>
                                <FormField label="اسم المالك">
                                    <InputField value={settings.owner_name} onChange={e => update('owner_name', e.target.value)} placeholder="اسم المالك" />
                                </FormField>
                                <FormField label="رقم الهاتف">
                                    <InputField value={settings.phone} onChange={e => update('phone', e.target.value)} placeholder="رقم الهاتف" type="tel" />
                                </FormField>
                                <FormField label="رقم الترخيص">
                                    <InputField value={settings.license_number} onChange={e => update('license_number', e.target.value)} placeholder="رقم الترخيص" />
                                </FormField>
                                <FormField label="الرقم الضريبي (VAT)">
                                    <InputField value={settings.vat_number} onChange={e => update('vat_number', e.target.value)} placeholder="الرقم الضريبي" />
                                </FormField>
                                <FormField label="العملة">
                                    <select
                                        value={settings.currency}
                                        onChange={e => update('currency', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="YER">ريال يمني (ر.ي)</option>
                                        <option value="AED">درهم إماراتي</option>
                                        <option value="USD">دولار أمريكي</option>
                                    </select>
                                </FormField>
                                <FormField label="العنوان">
                                    <InputField value={settings.address} onChange={e => update('address', e.target.value)} placeholder="العنوان" />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">إعدادات الإشعارات</h3>
                            <Toggle label="تنبيه عند انخفاض المخزون" checked={settings.low_stock_alert} onChange={v => update('low_stock_alert', v)} />
                            <Toggle label="تنبيه قبل انتهاء الصلاحية (30 يوم)" checked={settings.expiry_alert} onChange={v => update('expiry_alert', v)} />
                            <Toggle label="إرسال تقرير يومي" checked={settings.daily_report} onChange={v => update('daily_report', v)} />
                            <Toggle label="أصوات الإشعارات" checked={settings.sound_notifications} onChange={v => update('sound_notifications', v)} />
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">إعدادات الأمان</h3>
                            <Toggle label="طلب كلمة المرور عند كل تسجيل دخول" checked={settings.require_password} onChange={v => update('require_password', v)} />
                            <Toggle label="النسخ الاحتياطي التلقائي" checked={settings.auto_backup} onChange={v => update('auto_backup', v)} />
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <FormField label="تغيير كلمة المرور">
                                    <div className="space-y-3">
                                        <InputField placeholder="كلمة المرور الحالية" type="password" />
                                        <InputField placeholder="كلمة المرور الجديدة" type="password" />
                                        <InputField placeholder="تأكيد كلمة المرور" type="password" />
                                        <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">تحديث كلمة المرور</button>
                                    </div>
                                </FormField>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="space-y-5">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">إعدادات المظهر</h3>
                            <FormField label="حجم الخط">
                                <div className="flex gap-3">
                                    {[['small', 'صغير'], ['medium', 'متوسط'], ['large', 'كبير']].map(([val, label]) => (
                                        <button
                                            key={val}
                                            onClick={() => update('font_size', val)}
                                            className={cn(
                                                "px-5 py-2 rounded-xl border text-sm font-medium transition-all",
                                                settings.font_size === val
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            )}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                            <FormField label="سمة التطبيق">
                                <div className="flex gap-4">
                                    {[
                                        { val: 'light', label: 'فاتح', bg: 'bg-white', border: 'border-slate-300', icon: '☀️' },
                                        { val: 'dark', label: 'داكن', bg: 'bg-slate-800', border: 'border-slate-600', icon: '🌙' },
                                    ].map(t => (
                                        <button
                                            key={t.val}
                                            onClick={() => update('theme', t.val)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                                settings.theme === t.val ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-slate-200'
                                            )}
                                        >
                                            <div className={cn("w-16 h-10 rounded-lg border", t.bg, t.border)} />
                                            <span className="text-sm font-medium text-slate-700">{t.icon} {t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
