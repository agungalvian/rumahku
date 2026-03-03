import { useState, useEffect, useRef } from 'react';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import TrackerPage from './pages/TrackerPage';
import KprFlowPage from './pages/KprFlowPage';
import SimulasiPage from './pages/SimulasiPage';
import KonsultasiPage from './pages/KonsultasiPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import PesertaPage from './pages/PesertaPage';
import AktivasiPeserta from './pages/peserta/AktivasiPeserta';
import DaftarMandiri from './pages/peserta/DaftarMandiri';
import { LayoutGrid, Calculator, CalendarCheck, MessageCircle, RefreshCw, IdCard } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { usePWAUpdate } from './hooks/usePWAUpdate';

type NavState = { page: string; propertyId?: string };

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const { startKprFlow } = useAppContext();
  const { needRefresh, updateSW } = usePWAUpdate();
  const exitToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showExitToast, setShowExitToast] = useState(false);

  // Seed the initial history entry once on mount so there's always something to pop
  useEffect(() => {
    history.replaceState({ page: 'home' } satisfies NavState, '');
  }, []);

  // Handle Android / browser back button
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const state: NavState | null = e.state;

      if (!state || state.page === 'home') {
        if (currentPage === 'home') {
          // Already at root — push a fresh entry so the NEXT back has something to pop
          history.pushState({ page: 'home' } satisfies NavState, '');
          if (showExitToast) {
            // Second back press → let browser/OS handle exit
            // (window.close() only works for PWA-opened tabs in some cases)
            window.close();
          } else {
            setShowExitToast(true);
            if (exitToastRef.current) clearTimeout(exitToastRef.current);
            exitToastRef.current = setTimeout(() => setShowExitToast(false), 2500);
          }
        } else {
          // Not at home — go back to home
          setCurrentPage('home');
          setSelectedPropertyId(null);
        }
        return;
      }

      // Restore whatever page was stored in the history entry
      setCurrentPage(state.page);
      setSelectedPropertyId(state.propertyId ?? null);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showExitToast]);

  const navigateTo = (page: string, id?: string) => {
    const state: NavState = { page, propertyId: id };
    history.pushState(state, '');
    setCurrentPage(page);
    if (id) setSelectedPropertyId(id);
  };

  const startKpr = (propertyId?: string) => {
    startKprFlow(propertyId);
    navigateTo('kpr');
  };

  const tabs = [
    { key: 'home', label: 'Eksplor', Icon: LayoutGrid },
    { key: 'peserta', label: 'Peserta', Icon: IdCard },
    { key: 'simulasi', label: 'Simulasi', Icon: Calculator },
    { key: 'tracker', label: 'Riwayat', Icon: CalendarCheck },
    { key: 'konsultasi', label: 'Konsultasi', Icon: MessageCircle },
  ] as const;

  const tabPages = tabs.map(t => t.key) as string[];
  const isTab = tabPages.includes(currentPage);

  return (
    <div style={{ paddingBottom: isTab ? '68px' : '0', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>

      {/* Page Content */}
      {currentPage === 'home' && <HomePage onNavigate={navigateTo} onStartKpr={startKpr} />}
      {currentPage === 'detail' && selectedPropertyId && (
        <DetailPage propertyId={selectedPropertyId} onNavigate={navigateTo} onStartKpr={startKpr} />
      )}
      {currentPage === 'wishlist' && <TrackerPage onNavigate={navigateTo} onStartKpr={startKpr} wishlistOnly />}
      {currentPage === 'simulasi' && <SimulasiPage />}
      {currentPage === 'peserta' && <PesertaPage onNavigate={navigateTo} />}
      {currentPage === 'aktivasi-peserta' && <AktivasiPeserta onNavigate={navigateTo} />}
      {currentPage === 'daftar-mandiri' && <DaftarMandiri onNavigate={navigateTo} />}
      {currentPage === 'tracker' && <TrackerPage onNavigate={navigateTo} onStartKpr={startKpr} />}
      {currentPage === 'konsultasi' && <KonsultasiPage />}
      {currentPage === 'kpr' && <KprFlowPage onNavigate={navigateTo} />}
      {currentPage === 'search' && <SearchPage onNavigate={navigateTo} />}
      {currentPage === 'profile' && <ProfilePage onNavigate={navigateTo} />}

      {/* 5-Tab Bottom Navigation */}
      {isTab && (
        <div style={{
          position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px',
          backgroundColor: 'white',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          zIndex: 100,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.07)',
        }}>
          {tabs.map(({ key, label, Icon }) => {
            const isActive = currentPage === key;
            return (
              <button
                key={key}
                onClick={() => navigateTo(key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px 14px',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  gap: '4px',
                  borderTop: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'transparent',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, lineHeight: 1 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* PWA Update Banner */}
      {needRefresh && (
        <div style={{
          position: 'fixed', bottom: isTab ? '68px' : '0', left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '480px', zIndex: 200,
          backgroundColor: '#2563EB', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>✨ Versi baru tersedia!</span>
          <button
            onClick={() => updateSW()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'white', color: '#2563EB',
              padding: '6px 14px', borderRadius: '20px',
              fontSize: '0.8rem', fontWeight: 700, border: 'none',
            }}
          >
            <RefreshCw size={14} /> Perbarui
          </button>
        </div>
      )}

      {/* "Press again to exit" toast */}
      {showExitToast && (
        <div style={{
          position: 'fixed', bottom: isTab ? '80px' : '16px',
          left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.75)', color: 'white',
          padding: '10px 20px', borderRadius: '20px',
          fontSize: '0.85rem', zIndex: 300, whiteSpace: 'nowrap',
        }}>
          Tekan sekali lagi untuk keluar
        </div>
      )}
    </div>
  );
}

export default App;
