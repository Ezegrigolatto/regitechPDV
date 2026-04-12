import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSaleOrders,
  getSaleOrderById,
  getPaymentMethods,
  type SaleOrderFilters,
} from '@/services/sale-orders.service';
import supabase from '../../supabase-config';

export const saleOrderKeys = {
  all: ['sale_orders'] as const,
  lists: () => [...saleOrderKeys.all, 'list'] as const,
  list: (filters?: SaleOrderFilters) => [...saleOrderKeys.lists(), filters] as const,
  detail: (id: string) => [...saleOrderKeys.all, 'detail', id] as const,
  paymentMethods: () => ['payment_methods'] as const,
};

export function useSaleOrders(filters?: SaleOrderFilters) {
  return useQuery({
    queryKey: saleOrderKeys.list(filters),
    queryFn: () => getSaleOrders(filters),
  });
}

export function useSaleOrder(id: string) {
  return useQuery({
    queryKey: saleOrderKeys.detail(id),
    queryFn: () => getSaleOrderById(id),
    enabled: !!id,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: saleOrderKeys.paymentMethods(),
    queryFn: getPaymentMethods,
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      ticket_id: string;
      order_type: 'sale' | 'remito' | 'presupuesto';
      payments: {
        payment_method_id: string;
        amount: number;
        reference?: string;
      }[];
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/close-ticket`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Error al cerrar ticket');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['branch_stock'] });
    },
  });
}

export function useCancelSaleOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sale_order_id: string; reason?: string }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-sale-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Error al cancelar orden');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['branch_stock'] });
    },
  });
}
