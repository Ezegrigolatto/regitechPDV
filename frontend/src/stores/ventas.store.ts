import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TicketItem } from '@/services/tickets.service';
import { calculateItemSubtotal, calculateTicketTotals } from '@/services/tickets.service';

export interface LocalTicket {
  id: string;           // ID de Supabase (se llena al guardar)
  label: string;        // "Ticket 1", "Ticket 2", etc.
  branch_id: string;
  customer_id: string | null;
  price_list: 'retail' | 'wholesale';
  items: TicketItem[];
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  subtotal: number;
  tax_total: number;
  total: number;
  notes: string | null;
  synced: boolean;      // true = guardado en Supabase
}

interface VentasStore {
  tickets: LocalTicket[];
  activeTicketId: string | null;

  // Ticket management
  addTicket: (branchId: string, createdBy: string) => void;
  removeTicket: (id: string) => void;
  setActiveTicket: (id: string) => void;
  setTickets: (tickets: LocalTicket[]) => void;
  markSynced: (id: string, supabaseId: string) => void;

  // Item management
  addItem: (ticketId: string, item: TicketItem) => void;
  removeItem: (ticketId: string, productId: string) => void;
  incrementItem: (ticketId: string, productId: string) => void;
  decrementItem: (ticketId: string, productId: string) => void;
  updateItemQuantity: (ticketId: string, productId: string, quantity: number) => void;

  // Ticket fields
  setCustomer: (ticketId: string, customerId: string | null) => void;
  setPriceList: (ticketId: string, priceList: 'retail' | 'wholesale') => void;
  setDiscount: (ticketId: string, type: 'percentage' | 'fixed' | null, value: number | null) => void;

  // Helpers
  getActiveTicket: () => LocalTicket | null;
  clearTicket: (id: string) => void;
}

function recalculate(ticket: LocalTicket): LocalTicket {
  const { subtotal, tax_total, total } = calculateTicketTotals(
    ticket.items,
    ticket.discount_type,
    ticket.discount_value
  );
  return { ...ticket, subtotal, tax_total, total };
}

function generateId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useVentasStore = create<VentasStore>()(
  persist(
    (set, get) => ({
      tickets: [],
      activeTicketId: null,

      addTicket: (branchId, _createdBy) => {
        const { tickets } = get();
        if (tickets.length >= 5) return;

        const label = `Ticket ${tickets.length + 1}`;
        const newTicket: LocalTicket = {
          id: generateId(),
          label,
          branch_id: branchId,
          customer_id: null,
          price_list: 'retail',
          items: [],
          discount_type: null,
          discount_value: null,
          subtotal: 0,
          tax_total: 0,
          total: 0,
          notes: null,
          synced: false,
        };

        set({
          tickets: [...tickets, newTicket],
          activeTicketId: newTicket.id,
        });
      },

      removeTicket: (id) => {
        const { tickets, activeTicketId } = get();
        const filtered = tickets.filter((t) => t.id !== id);
        const newActive =
          activeTicketId === id
            ? (filtered[filtered.length - 1]?.id ?? null)
            : activeTicketId;

        set({ tickets: filtered, activeTicketId: newActive });
      },

      setActiveTicket: (id) => set({ activeTicketId: id }),

      setTickets: (tickets) => set({ tickets }),

      markSynced: (id, supabaseId) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, id: supabaseId, synced: true } : t
          ),
          activeTicketId:
            state.activeTicketId === id ? supabaseId : state.activeTicketId,
        }));
      },

      addItem: (ticketId, item) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            const existing = t.items.find((i) => i.product_id === item.product_id);
            let newItems: TicketItem[];

            if (existing) {
              newItems = t.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + 1, subtotal: i.unit_price * (i.quantity + 1) }
                  : i
              );
            } else {
              newItems = [...t.items, item];
            }

            return recalculate({ ...t, items: newItems });
          }),
        }));
      },

      removeItem: (ticketId, productId) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            return recalculate({
              ...t,
              items: t.items.filter((i) => i.product_id !== productId),
            });
          }),
        }));
      },

      incrementItem: (ticketId, productId) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            const newItems = t.items.map((i) => {
              if (i.product_id !== productId) return i;
              const qty = i.quantity + 1;
              const { subtotal, tax_amount } = calculateItemSubtotal(
                qty, i.unit_price, i.discount_type, i.discount_value, i.tax_rate
              );
              return { ...i, quantity: qty, subtotal, tax_amount };
            });
            return recalculate({ ...t, items: newItems });
          }),
        }));
      },

      decrementItem: (ticketId, productId) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            const newItems = t.items
              .map((i) => {
                if (i.product_id !== productId) return i;
                const qty = i.quantity - 1;
                if (qty <= 0) return null;
                const { subtotal, tax_amount } = calculateItemSubtotal(
                  qty, i.unit_price, i.discount_type, i.discount_value, i.tax_rate
                );
                return { ...i, quantity: qty, subtotal, tax_amount };
              })
              .filter(Boolean) as TicketItem[];
            return recalculate({ ...t, items: newItems });
          }),
        }));
      },

      updateItemQuantity: (ticketId, productId, quantity) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            const newItems =
              quantity <= 0
                ? t.items.filter((i) => i.product_id !== productId)
                : t.items.map((i) => {
                    if (i.product_id !== productId) return i;
                    const { subtotal, tax_amount } = calculateItemSubtotal(
                      quantity, i.unit_price, i.discount_type, i.discount_value, i.tax_rate
                    );
                    return { ...i, quantity, subtotal, tax_amount };
                  });
            return recalculate({ ...t, items: newItems });
          }),
        }));
      },

      setCustomer: (ticketId, customerId) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, customer_id: customerId } : t
          ),
        }));
      },

      setPriceList: (ticketId, priceList) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            const newItems = t.items.map((i) => ({
              ...i,
              unit_price: priceList === 'wholesale' ? i.retail_price : i.retail_price,
            }));
            return recalculate({ ...t, price_list: priceList, items: newItems });
          }),
        }));
      },

      setDiscount: (ticketId, type, value) => {
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== ticketId) return t;
            return recalculate({ ...t, discount_type: type, discount_value: value });
          }),
        }));
      },

      getActiveTicket: () => {
        const { tickets, activeTicketId } = get();
        return tickets.find((t) => t.id === activeTicketId) ?? null;
      },

      clearTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
          activeTicketId:
            state.activeTicketId === id
              ? (state.tickets.filter((t) => t.id !== id).at(-1)?.id ?? null)
              : state.activeTicketId,
        }));
      },
    }),
    { name: 'ventas-store' }
  )
);