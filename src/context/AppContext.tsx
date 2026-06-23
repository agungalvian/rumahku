import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { properties } from '../data/mockData';

export interface KprFormData {
    nik: string;
    email: string;
    phone: string;
    password: string;
    fullName: string;
    job: string;
    income: string;
    selectedPropertyId: string | null;
    appointmentDate: string;
    appointmentTime: string;
    // New fields
    kkNumber: string;
    npwp: string;
    maritalStatus: 'KAWIN' | 'Tidak Kawin' | '';
    spouseNik: string;
    spouseName: string;
    spouseDob: string;
    spouseIncome: string;
    bankName: string;
    propertyTitle?: string;
    propertyLocation?: string;
    propertyPrice?: number;
}

export interface UserProfile {
    nik: string;
    fullName: string;
    email: string;
    phone: string;
}

interface AppState {
    wishlist: string[];
    addToWishlist: (id: string) => void;
    removeFromWishlist: (id: string) => void;
    notifications: string[];
    addNotification: (msg: string) => void;
    // Auth
    isLoggedIn: boolean;
    userName: string;
    login: (userData: UserProfile) => void;
    logout: () => void;
    userProfile: UserProfile | null;
    updateUserProfile: (data: Partial<UserProfile>) => void;
    // KPR Flow
    kprStep: number;
    kprFormData: KprFormData;
    kprSubmitted: boolean;
    startKprFlow: (propertyId?: string) => void;
    nextKprStep: () => void;
    prevKprStep: () => void;
    updateKprFormData: (data: Partial<KprFormData>) => void;
    submitKpr: () => void;
}

const defaultKprForm: KprFormData = {
    nik: '',
    email: '',
    phone: '',
    password: '',
    fullName: '',
    job: '',
    income: '',
    selectedPropertyId: null,
    appointmentDate: '',
    appointmentTime: '',
    kkNumber: '',
    npwp: '',
    maritalStatus: '',
    spouseNik: '',
    spouseName: '',
    spouseDob: '',
    spouseIncome: '',
    bankName: '',
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<string[]>([
        "Rumah di Pesona Permata Bogor sedang promo! Turun harga dari Rp180jt ke Rp175jt."
    ]);
    const [kprStep, setKprStep] = useState(1);
    const [kprFormData, setKprFormData] = useState<KprFormData>(defaultKprForm);
    const [kprSubmitted, setKprSubmitted] = useState(false);
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('umah_user'));
    const [userName, setUserName] = useState(() => localStorage.getItem('umah_user') ?? '');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem('umah_user_profile');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData: UserProfile) => {
        localStorage.setItem('umah_user', userData.fullName);
        setUserName(userData.fullName);
        setIsLoggedIn(true);

        setUserProfile(userData);
        localStorage.setItem('umah_user_profile', JSON.stringify(userData));
    };

    const logout = () => {
        localStorage.removeItem('umah_user');
        localStorage.removeItem('umah_user_profile');
        setIsLoggedIn(false);
        setUserName('');
        setUserProfile(null);
    };

    const updateUserProfile = (data: Partial<UserProfile>) => {
        setUserProfile(prev => {
            const updated = prev ? { ...prev, ...data } : null;
            if (updated) {
                localStorage.setItem('umah_user_profile', JSON.stringify(updated));
            }
            return updated;
        });
    };

    const addToWishlist = (id: string) => {
        if (!wishlist.includes(id)) {
            setWishlist([...wishlist, id]);
            const prop = properties.find(p => p.id === id);
            if (prop?.isPromo) {
                addNotification(`Kabar baik! Rumah impianmu di ${prop.title} sedang turun harga!`);
            }
        }
    };

    const removeFromWishlist = (id: string) => {
        setWishlist(wishlist.filter(wId => wId !== id));
    };

    const addNotification = (msg: string) => {
        setNotifications(prev => [msg, ...prev]);
    };

    const startKprFlow = (propertyId?: string) => {
        setKprStep(1);
        setKprSubmitted(false);
        setKprFormData({ ...defaultKprForm, selectedPropertyId: propertyId || null });
    };

    const nextKprStep = () => setKprStep(s => Math.min(s + 1, isLoggedIn ? 4 : 6));
    const prevKprStep = () => setKprStep(s => Math.max(s - 1, 1));
    const updateKprFormData = (data: Partial<KprFormData>) =>
        setKprFormData(prev => ({ ...prev, ...data }));
    const submitKpr = async () => {
        const prop = properties.find(p => p.id === kprFormData.selectedPropertyId);

        try {
            // If guest, register account first
            if (!isLoggedIn) {
                const regRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nik: kprFormData.nik,
                        nama_lengkap: kprFormData.fullName,
                        email: kprFormData.email,
                        password: kprFormData.password
                    })
                });
                const regResult = await regRes.json();
                if (!regRes.ok) {
                    alert(regResult.error || 'Gagal membuat akun.');
                    return;
                }
                // Log the user in after registration
                login({
                    nik: regResult.data.nik,
                    fullName: regResult.data.nama_lengkap,
                    email: regResult.data.email,
                    phone: ''
                });
            }

            const res = await fetch('/api/kpr/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nik: userProfile?.nik || kprFormData.nik,
                    property_id: kprFormData.selectedPropertyId,
                    property_title: kprFormData.propertyTitle || prop?.title,
                    property_location: kprFormData.propertyLocation || prop?.location,
                    property_price: kprFormData.propertyPrice || prop?.price,
                    bank_name: kprFormData.bankName,
                    appointment_date: kprFormData.appointmentDate,
                    appointment_time: kprFormData.appointmentTime
                })
            });
            const result = await res.json();

            if (res.ok && result.success) {
                setKprSubmitted(true);
                setKprStep(isLoggedIn ? 4 : 6);
            } else {
                alert(result.error || 'Gagal mengirim pengajuan.');
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan.');
        }
    };

    return (
        <AppContext.Provider value={{
            wishlist, addToWishlist, removeFromWishlist,
            notifications, addNotification,
            kprStep, kprFormData, kprSubmitted,
            isLoggedIn, userName, login, logout,
            userProfile, updateUserProfile,
            startKprFlow, nextKprStep, prevKprStep, updateKprFormData, submitKpr
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
