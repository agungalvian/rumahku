import React from 'react';
import { ArrowLeft, User, Mail, Phone, CreditCard } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ProfilePageProps {
    onNavigate: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
    const { userProfile } = useAppContext();

    if (!userProfile) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Silakan login untuk melihat profil.</p>
            <button onClick={() => onNavigate('home')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Kembali</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            {/* Header */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 50,
                backgroundColor: 'white',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.875rem 1rem',
                display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
                <button
                    onClick={() => onNavigate('home')}
                    style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Profil Saya</h1>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {/* Profile Header Card */}
                <div style={{
                    backgroundColor: 'white', borderRadius: '20px', padding: '1.5rem',
                    textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        backgroundColor: '#F0FDF4', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 800,
                        border: '4px solid white',
                        boxShadow: '0 4px 10px rgba(0,145,58,0.1)'
                    }}>
                        {userProfile.fullName.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>{userProfile.fullName}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, backgroundColor: '#F0FDF4', display: 'inline-block', padding: '2px 12px', borderRadius: '20px' }}>
                        Peserta Tapera Aktif
                    </p>
                </div>

                {/* Profile Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '20px', padding: '1.25rem',
                        border: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column', gap: '1.25rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                backgroundColor: '#F8FAFC', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #F1F5F9'
                            }}>
                                <CreditCard size={18} color="#64748B" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>NIK</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{userProfile.nik}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                backgroundColor: '#F8FAFC', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #F1F5F9'
                            }}>
                                <User size={18} color="#64748B" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Nama Lengkap</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{userProfile.fullName}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                backgroundColor: '#F8FAFC', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #F1F5F9'
                            }}>
                                <Mail size={18} color="#64748B" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Email</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{userProfile.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                backgroundColor: '#F8FAFC', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #F1F5F9'
                            }}>
                                <Phone size={18} color="#64748B" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>Nomor Handphone</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{userProfile.phone}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Data profil ini bersumber dari verifikasi Dukcapil dan Tapera. Hubungi call center jika terdapat ketidaksesuaian data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
