import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PublicMenuLoader from '@/components/public-menu/PublicMenuLoader';
import { isReservedSlug } from '@/lib/reservedSlugs';
import { AlertTriangle } from 'lucide-react';

interface ResolvedMenu {
  menu_id: string | null;
  user_id: string;
  outlet_id: string;
  outlet_name: string;
  whatsapp_number: string | null;
  restaurant_name: string | null;
}

const PublicMenuBySlug: React.FC = () => {
  const { restaurantSlug, outletSlug } = useParams<{ restaurantSlug: string; outletSlug: string }>();
  const location = useLocation();
  const [resolved, setResolved] = useState<ResolvedMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantSlug || !outletSlug) {
      setError('URL invalide');
      setLoading(false);
      return;
    }

    if (isReservedSlug(restaurantSlug)) {
      setError('Restaurant introuvable');
      setLoading(false);
      return;
    }

    // Cache pour offline
    const cacheKey = `slugMenu_${restaurantSlug}_${outletSlug}`;

    (async () => {
      try {
        const { data, error: rpcError } = await (supabase as any)
          .rpc('resolve_public_menu', {
            _restaurant_slug: restaurantSlug,
            _outlet_slug: outletSlug,
          });

        if (rpcError) throw rpcError;
        const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!row || !row.menu_id) {
          // Fallback cache
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setResolved(JSON.parse(cached));
          } else {
            setError("Aucun menu actif pour ce restaurant et ce point de vente");
          }
        } else {
          setResolved(row);
          localStorage.setItem(cacheKey, JSON.stringify(row));
          // Stocker WhatsApp pour le checkout
          if (row.whatsapp_number) {
            sessionStorage.setItem(`whatsapp_${row.outlet_id}`, row.whatsapp_number);
          }
          if (row.outlet_name) {
            sessionStorage.setItem(`outletName_${row.outlet_id}`, row.outlet_name);
          }
        }
      } catch (e: any) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setResolved(JSON.parse(cached));
        } else {
          setError(e.message || 'Erreur de chargement');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantSlug, outletSlug]);

  if (loading) return <PublicMenuLoader />;

  if (error || !resolved || !resolved.menu_id) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Menu introuvable</h1>
          <p className="text-lg text-gray-600 mb-6">{error || "Le lien demandé ne correspond à aucun menu actif."}</p>
        </div>
      </div>
    );
  }

  // Rediriger vers PublicMenu avec menuId, en préservant les query params (ex: ?table=05)
  return <Navigate to={`/menu/${resolved.menu_id}${location.search}`} replace />;
};

export default PublicMenuBySlug;
