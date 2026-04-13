import React from 'react';
export default function PlaceholderPage({ title }) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">...</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p>هذه الصفحة قيد التطوير حالياً كجزء من النظام الأساسي</p>
        </div>
    );
}

export const Inventory = () => <PlaceholderPage title="المخزون" />;
export const Customers = () => <PlaceholderPage title="العملاء" />;
export const Suppliers = () => <PlaceholderPage title="الموردين" />;
export const Reports = () => <PlaceholderPage title="التقارير" />;
export const Settings = () => <PlaceholderPage title="الإعدادات" />;
