import { create } from 'zustand';
import { Invoice } from '@/hooks/useInvoices';

interface InvoiceStore {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  upsertInvoice: (invoice: Invoice) => void;
  removeInvoice: (id: string) => void;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  setInvoices: (invoices) => set({ invoices }),
  upsertInvoice: (invoice) =>
    set((state) => {
      const exists = state.invoices.some((i) => i.id === invoice.id);
      return {
        invoices: exists
          ? state.invoices.map((i) => (i.id === invoice.id ? { ...i, ...invoice } : i))
          : [invoice, ...state.invoices],
      };
    }),
  removeInvoice: (id) =>
    set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) })),
  updateInvoice: (id, patch) =>
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),
}));
