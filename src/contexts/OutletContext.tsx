import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OutletContextType {
  selectedOutletId: string | null;
  setSelectedOutletId: (id: string | null) => void;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export const OutletProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOutletId, setSelectedOutletIdState] = useState<string | null>(
    () => localStorage.getItem('selectedOutletId')
  );

  const setSelectedOutletId = (id: string | null) => {
    setSelectedOutletIdState(id);
    if (id) {
      localStorage.setItem('selectedOutletId', id);
    } else {
      localStorage.removeItem('selectedOutletId');
    }
    // Broadcast same-tab change so other consumers can re-read.
    try {
      window.dispatchEvent(new CustomEvent('outlet:changed', { detail: { id } }));
    } catch {}
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'selectedOutletId') {
        setSelectedOutletIdState(e.newValue);
      }
    };
    const handleCustom = () => {
      const current = localStorage.getItem('selectedOutletId');
      setSelectedOutletIdState((prev) => (prev === current ? prev : current));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('outlet:changed', handleCustom as EventListener);
    // Poll once shortly after mount to catch async writes from useOptimizedOutlet
    const t = window.setTimeout(handleCustom, 1500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('outlet:changed', handleCustom as EventListener);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <OutletContext.Provider value={{ selectedOutletId, setSelectedOutletId }}>
      {children}
    </OutletContext.Provider>
  );
};

export const useOutletContext = () => {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error('useOutletContext doit être dans OutletProvider');
  return ctx;
};
