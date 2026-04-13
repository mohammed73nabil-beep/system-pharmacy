import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

function AppRoot() {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem('pharmacy_auth');
        if (auth === 'true') {
            setIsAuth(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = () => {
        localStorage.setItem('pharmacy_auth', 'true');
        setIsAuth(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('pharmacy_auth');
        setIsAuth(false);
    };

    if (loading) return <div className="min-h-screen bg-slate-50"></div>;

    if (!isAuth) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout onLogout={handleLogout} />}>
                    <Route index element={<Dashboard />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="medicines" element={<Medicines />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoot;
