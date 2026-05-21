'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import TelemetryModal from './TelemetryModal';
import GuestTelemetryModal from './GuestTelemetryModal';
import GuestPreferencesModal from './GuestPreferencesModal';
import UserPreferencesModal from './UserPreferencesModal';

export default function TelemetryTrigger() {
  const [modalState, setModalState] = useState<'none' | 'logged' | 'guestIntro' | 'guestForm' | 'userForm'>('none');
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    
    // CAMBIO AQUÍ: Ahora usamos sessionStorage para que salga en cada pestaña
    const hasSeenLogged = sessionStorage.getItem('has_seen_telemetry');
    
    const hasSeenGuest = sessionStorage.getItem('has_seen_guest_telemetry');

    if ((token && hasSeenLogged) || (!token && hasSeenGuest)) return;

    const timer = setTimeout(() => {
      if (token && !hasSeenLogged) {
        setModalState('logged');
      } else if (!token && !hasSeenGuest) {
        setModalState('guestIntro');
      }
    }, 4000); 

    return () => clearTimeout(timer);
  }, [pathname]);

  // --- LÓGICA: USUARIO LOGUEADO (Ahora guarda en sessionStorage) ---
  const closeLogged = () => {
    setModalState('none');
    sessionStorage.setItem('has_seen_telemetry', 'true'); // <-- Cambio
  };

  const openUserForm = () => {
    setModalState('userForm'); 
  };

  const closeUserForm = () => {
    setModalState('none');
    sessionStorage.setItem('has_seen_telemetry', 'true'); // <-- Cambio
  };

  // --- LÓGICA: INVITADO ---
  const closeGuestIntro = () => {
    setModalState('none');
    sessionStorage.setItem('has_seen_guest_telemetry', 'true');
  };
  
  const openGuestForm = () => setModalState('guestForm');
  
  const closeGuestForm = () => {
    setModalState('none');
    sessionStorage.setItem('has_seen_guest_telemetry', 'true');
  };

  return (
    <>
      {/* Modales de Usuario Logueado */}
      <TelemetryModal 
        isOpen={modalState === 'logged'} 
        onClose={closeLogged} 
        onAccept={openUserForm} 
      />
      <UserPreferencesModal 
        isOpen={modalState === 'userForm'} 
        onClose={closeUserForm} 
        onSuccess={closeUserForm} 
      />

      {/* Modales de Invitados */}
      <GuestTelemetryModal 
        isOpen={modalState === 'guestIntro'} 
        onClose={closeGuestIntro} 
        onAccept={openGuestForm} 
      />
      <GuestPreferencesModal 
        isOpen={modalState === 'guestForm'} 
        onClose={closeGuestForm} 
      />
    </>
  );
}