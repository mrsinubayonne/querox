import React, { useEffect, useState } from 'react';
import { X, Megaphone, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'destructive';
  kind: 'modal' | 'banner' | 'both';
}

const variantStyles: Record<string, string> = {
  info: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
};

const variantIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertTriangle,
};

const GlobalAnnouncementBanner: React.FC = () => {
  const { user } = useAuth();
  const [banner, setBanner] = useState<Announcement | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await (supabase as any)
        .from('app_announcements')
        .select('id,title,message,variant,kind')
        .eq('is_active', true)
        .in('kind', ['banner', 'both'])
        .lte('starts_at', nowIso)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data?.id) return;
      if (localStorage.getItem(`app_banner_dismissed_${data.id}`)) return;
      setBanner(data as Announcement);
    })();
  }, [user]);

  if (!banner) return null;
  const Icon = variantIcons[banner.variant] || Megaphone;

  return (
    <div className={`w-full border-b ${variantStyles[banner.variant] || variantStyles.info}`}>
      <div className="max-w-7xl mx-auto flex items-start gap-3 px-4 py-2.5">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold">{banner.title}</span>
          <span className="mx-2 opacity-40">•</span>
          <span className="whitespace-pre-wrap">{banner.message}</span>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(`app_banner_dismissed_${banner.id}`, '1');
            setBanner(null);
          }}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GlobalAnnouncementBanner;
