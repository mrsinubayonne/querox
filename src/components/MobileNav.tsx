import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, LogOut, Building2, Check, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface MobileNavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MobileNavProps {
  primary: MobileNavItem[];
  more: MobileNavItem[];
  outlets: { id: string; name: string }[];
  selectedOutletId?: string | null;
  onOutletChange: (id: string) => void;
  profileName?: string;
  onLogout: () => void;
  badgePath?: string;
  badge?: number;
}

/** Navigation dédiée au téléphone : barre en haut + barre d'onglets en bas + grille "Menu". */
const MobileNav: React.FC<MobileNavProps> = ({
  primary, more, outlets, selectedOutletId, onOutletChange, profileName, onLogout, badgePath, badge,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const current = location.pathname;
  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId);
  const moreActive = more.some((m) => current.startsWith(m.path));

  useEffect(() => {
    document.body.classList.add('has-mobile-nav');
    return () => document.body.classList.remove('has-mobile-nav');
  }, []);

  const go = (path: string) => { setOpen(false); navigate(path); };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-14 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        <span className="text-lg font-bold text-primary">Querox</span>
        <span className="text-xs text-muted-foreground truncate max-w-[55%] flex items-center gap-1">
          <Building2 size={14} /> {selectedOutlet?.name || ''}
        </span>
      </header>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {primary.slice(0, 4).map((item) => {
          const active = current === item.path;
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] active:scale-[0.97] ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              <item.icon size={22} />
              {item.label}
              {item.path === badgePath && !!badge && badge > 0 && (
                <span className="absolute top-1 right-1/4 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] active:scale-[0.97] ${moreActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
        >
          <LayoutGrid size={22} />
          Menu
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          {profileName && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <User size={16} /> {profileName}
            </div>
          )}

          {outlets.length > 1 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Point de vente</p>
              <div className="flex flex-wrap gap-2">
                {outlets.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setOpen(false); onOutletChange(o.id); }}
                    className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-1 active:scale-[0.97] ${o.id === selectedOutletId ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
                  >
                    {o.id === selectedOutletId && <Check size={14} />} {o.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3">
            {more.map((item) => {
              const active = current.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 min-h-[84px] text-xs text-center active:scale-[0.97] ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background'}`}
                >
                  <item.icon size={24} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-destructive active:scale-[0.97]"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;
