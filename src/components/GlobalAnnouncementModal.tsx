import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  message: string;
}

const GlobalAnnouncementModal: React.FC = () => {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadAnnouncement = async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await (supabase as any)
        .from('app_announcements')
        .select('id,title,message,kind')
        .eq('is_active', true)
        .in('kind', ['modal', 'both'])
        .lte('starts_at', nowIso)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data?.id) return;
      const seenKey = `app_announcement_seen_${data.id}`;
      if (localStorage.getItem(seenKey)) return;
      setAnnouncement(data as Announcement);
      setOpen(true);
    };

    void loadAnnouncement();
  }, [user]);

  const close = () => {
    if (announcement?.id) localStorage.setItem(`app_announcement_seen_${announcement.id}`, 'true');
    setOpen(false);
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle>{announcement.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-wrap text-base text-foreground/80">
            {announcement.message}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={close} className="w-full">Compris</Button>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalAnnouncementModal;
