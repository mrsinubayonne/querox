import { supabase } from '@/integrations/supabase/client';
import { appendAudit, entityLabel } from '@/lib/profileAccess';

const IGNORED_TABLES = new Set([
  'button_clicks',
  'analytics_events',
  'app_announcements',
  'sync_queue',
]);

const ACTION_BY_OP: Record<string, 'ajout' | 'modification' | 'suppression'> = {
  insert: 'ajout',
  upsert: 'ajout',
  update: 'modification',
  delete: 'suppression',
};

const summarize = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;
  const row = Array.isArray(payload) ? payload[0] : payload;
  if (!row || typeof row !== 'object') return undefined;
  const r = row as Record<string, unknown>;
  const label =
    r.invoice_number || r.name || r.profile_name || r.title || r.item_name || r.customer_name;
  const extra = r.status ? ` • ${String(r.status)}` : '';
  return label ? `${String(label)}${extra}` : extra ? extra.replace(' • ', '') : undefined;
};

let installed = false;

/**
 * Journalise localement toutes les écritures (ajout / modification / suppression)
 * effectuées par le profil actuellement connecté.
 */
export const installAuditInterceptor = () => {
  if (installed) return;
  installed = true;

  const client = supabase as any;
  const originalFrom = client.from.bind(client);

  client.from = (table: string) => {
    const builder = originalFrom(table);
    if (IGNORED_TABLES.has(table)) return builder;

    (['insert', 'update', 'delete', 'upsert'] as const).forEach((op) => {
      const original = builder[op];
      if (typeof original !== 'function') return;
      builder[op] = (...args: any[]) => {
        const result = original.apply(builder, args);
        try {
          const originalThen = result.then.bind(result);
          result.then = (onFulfilled: any, onRejected: any) =>
            originalThen((value: any) => {
              try {
                if (!value?.error) {
                  appendAudit(ACTION_BY_OP[op], entityLabel(table), summarize(args[0]));
                }
              } catch {
                /* noop */
              }
              return onFulfilled ? onFulfilled(value) : value;
            }, onRejected);
        } catch {
          /* noop */
        }
        return result;
      };
    });

    return builder;
  };
};
