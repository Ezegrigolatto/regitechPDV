import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSuppliers,
  getSupplierById,
  getPurchaseOrders,
  getPurchaseOrdersBySupplier,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
  createPurchaseOrder,
  updatePurchaseOrder,
  type SupplierFilters,
  type Supplier,
  type PurchaseOrder,
} from '@/services/suppliers.service';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters?: SupplierFilters) => [...supplierKeys.lists(), filters] as const,
  detail: (id: string) => [...supplierKeys.all, 'detail', id] as const,
  purchaseOrders: () => ['purchase_orders'] as const,
  purchaseOrdersBySupplier: (supplier_id: string) =>
    [...supplierKeys.purchaseOrders(), supplier_id] as const,
};

export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => getSuppliers(filters),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => getSupplierById(id),
    enabled: !!id,
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: supplierKeys.purchaseOrders(),
    queryFn: getPurchaseOrders,
  });
}

export function usePurchaseOrdersBySupplier(supplier_id: string) {
  return useQuery({
    queryKey: supplierKeys.purchaseOrdersBySupplier(supplier_id),
    queryFn: () => getPurchaseOrdersBySupplier(supplier_id),
    enabled: !!supplier_id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, supplier }: { id: string; supplier: Partial<Supplier> }) =>
      updateSupplier(id, supplier),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.purchaseOrders() });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: Partial<PurchaseOrder> }) =>
      updatePurchaseOrder(id, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.purchaseOrders() });
    },
  });
}