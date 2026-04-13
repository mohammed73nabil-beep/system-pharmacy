import React, { useState } from 'react';
import { Store, User, Lock, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay for real feel
        setTimeout(() => {
            if (email === 'admin@pharmacy.com' && password === 'password') {
                onLogin();
            } else {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
            {/* Background elements */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 pattern-dots"></div>
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 shadow-xl">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2 relative z-10">نظام إدارة الصيدلية</h1>
                    <p className="text-blue-100 text-sm opacity-90 relative z-10">تسجيل الدخول للوحة التحكم</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold border border-rose-100 text-center animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                            <div className="relative">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@pharmacy.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">كلمة المرور</label>
                                <a href="#" className="text-xs text-blue-600 hover:underline font-bold">نسيت كلمة المرور؟</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all shadow-lg text-lg mt-4 text-white",
                                loading ? "bg-blue-400 cursor-wait shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5"
                            )}
                        >
                            {loading ? 'جاري التحقق...' : 'دخول النظام'}
                            {!loading && <ArrowRight className="w-5 h-5 rotate-180" />}
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            نسخة تجريبية مبسطة
                            <br />
                            للولوج السريع: استخدم <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">admin@pharmacy.com</code> و <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">password</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
