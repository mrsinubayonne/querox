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
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'selectedOutletId') {
        setSelectedOutletIdState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
