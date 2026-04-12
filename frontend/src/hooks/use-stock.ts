import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBranchStock,
  getLowStock,
  getStockMovements,
  manualStockAdjustment,
  type StockMovementFilters,
} from '@/services/stock.service';
import supabase from '../../supabase-config';

export const stockKeys = {
  all: ['branch_stock'] as const,
  byBranch: (branch_id: string) => [...stockKeys.all, branch_id] as const,
  lowStock: (branch_id: string) => [...stockKeys.all, 'low', branch_id] as const,
  movements: () => ['stock_movements'] as const,
  movementsList: (filters?: StockMovementFilters) =>
    [...stockKeys.movements(), filters] as const,
};

export function useBranchStock(branch_id: string) {
  return useQuery({
    queryKey: stockKeys.byBranch(branch_id),
    queryFn: () => getBranchStock(branch_id),
    enabled: !!branch_id,
  });
}

export function useLowStock(branch_id: string) {
  return useQuery({
    queryKey: stockKeys.lowStock(branch_id),
    queryFn: () => getLowStock(branch_id),
    enabled: !!branch_id,
  });
}

export function useStockMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: stockKeys.movementsList(filters),
    queryFn: () => getStockMovements(filters),
  });
}

export function useManualStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: manualStockAdjustment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: stockKeys.byBranch(data.branch_id),
      });
      queryClient.invalidateQueries({
        queryKey: stockKeys.lowStock(data.branch_id),
      });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchase_order_id: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/receive-purchase-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ purchase_order_id }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? 'Error al recibir orden');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
    },
  });
}
