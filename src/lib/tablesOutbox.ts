/**
 * File d'attente dédiée aux écritures de la section Tables.
 *
 * Principe: l'interface écrit toujours en local (instantané), et le réseau ne
 * sert qu'à rejouer ces actions vers le serveur en arrière-plan.
 */
import { supabase } from '@/integrations/supabase/client';

export type OutboxAction =
  | {
      kind: 'create';
      sessionId: string; // UUID généré côté client
      userId: string;
      outletId: string;
      tableNumber: string;
      numberOfGuests: number;
      items: unknown[];
      totalAmount: number;
    }
  | {
      kind: 'add';
      sessionId: string;
      tableNumber: string;
      items: unknown[];
      totalAmount: number;
    }
  | { kind: 'close'; sessionId: string }
  | { kind: 'pay'; sessionId: string; paymentMethod: string };

export interface OutboxEntry {
  id: string;
  createdAt: number;
  action: OutboxAction;
}

const KEY = 'querox_tables_outbox_v1';
const LISTENERS = new Set<(entries: OutboxEntry[]) => void>();

export function newUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOutbox(): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as OutboxEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: OutboxEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
  LISTENERS.forEach((fn) => fn(entries));
}

export function subscribeOutbox(fn: (entries: OutboxEntry[]) => void): () => void {
  LISTENERS.add(fn);
  fn(getOutbox());
  return () => LISTENERS.delete(fn);
}

export function enqueue(action: OutboxAction): OutboxEntry {
  const entry: OutboxEntry = { id: newUuid(), createdAt: Date.now(), action };
  save([...getOutbox(), entry]);
  return entry;
}

export function outboxCount(): number {
  return getOutbox().length;
}

/** Remplace un identifiant local par l'identifiant serveur dans les actions restantes. */
function remapSessionId(entries: OutboxEntry[], localId: string, serverId: string): OutboxEntry[] {
  if (localId === serverId) return entries;
  return entries.map((e) =>
    e.action.sessionId === localId
      ? ({ ...e, action: { ...e.action, sessionId: serverId } } as OutboxEntry)
      : e
  );
}

async function runAction(action: OutboxAction): Promise<{ serverSessionId?: string }> {
  switch (action.kind) {
    case 'create': {
      const { data, error } = await supabase.rpc('create_table_session_with_order', {
        _owner_id: action.userId,
        _outlet_id: action.outletId,
        _table_number: action.tableNumber,
        _number_of_guests: action.numberOfGuests,
        _items: action.items,
        _total_amount: action.totalAmount,
      });
      if (error) throw error;
      const session = (Array.isArray(data) ? data[0] : data) as { id?: string } | null;
      if (!session?.id) throw new Error("La commande n'a pas été enregistrée.");
      return { serverSessionId: session.id };
    }
    case 'add': {
      const { error } = await supabase.rpc('add_order_to_table_session', {
        _session_id: action.sessionId,
        _items: action.items,
        _total_amount: action.totalAmount,
        _customer_name: `Table ${action.tableNumber}`,
        _customer_phone: null,
        _customer_email: null,
        _notes: null,
      });
      if (error) throw error;
      return {};
    }
    case 'close': {
      const { error } = await supabase
        .from('table_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', action.sessionId);
      if (error) throw error;
      return {};
    }
    case 'pay': {
      const { error } = await supabase.rpc('mark_table_session_paid', {
        _session_id: action.sessionId,
        _payment_method: action.paymentMethod,
      });
      if (error) throw error;
      return {};
    }
  }
}

let flushing = false;

/**
 * Rejoue les actions en attente, dans l'ordre. S'arrête à la première erreur
 * réseau pour préserver l'ordre des opérations sur une même table.
 */
export async function flushOutbox(): Promise<{ sent: number; remaining: number }> {
  if (flushing) return { sent: 0, remaining: outboxCount() };
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { sent: 0, remaining: outboxCount() };
  }
  flushing = true;
  let sent = 0;
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const entries = getOutbox();
      if (entries.length === 0) break;
      const [head, ...rest] = entries;
      try {
        const { serverSessionId } = await runAction(head.action);
        let next = rest;
        if (serverSessionId && head.action.kind === 'create') {
          next = remapSessionId(rest, head.action.sessionId, serverSessionId);
        }
        save(next);
        sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isNetwork =
          /fetch|network|timeout|57014|Failed to fetch/i.test(message) ||
          (typeof navigator !== 'undefined' && !navigator.onLine);
        if (isNetwork) break;
        // Erreur métier définitive: on abandonne cette action pour ne pas bloquer la file.
        console.warn('[TablesOutbox] Action abandonnée:', head.action.kind, message);
        save(rest);
      }
    }
  } finally {
    flushing = false;
  }
  return { sent, remaining: outboxCount() };
}
