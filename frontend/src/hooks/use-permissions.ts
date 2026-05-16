import { useAuthStore } from '@/stores/auth.store';

type Role = 'admin' | 'vendedor' | 'cajero';

const PERMISSIONS = {
  // Productos
  products: {
    create: ['admin', 'vendedor'],
    edit: ['admin', 'vendedor'],
    delete: ['admin'],
    manageCategories: ['admin', 'vendedor'],
  },
  // Clientes
  customers: {
    create: ['admin', 'vendedor', 'cajero'],
    edit: ['admin', 'vendedor', 'cajero'],
    deactivate: ['admin'],
  },
  // Proveedores
  suppliers: {
    create: ['admin', 'vendedor'],
    edit: ['admin', 'vendedor'],
    deactivate: ['admin'],
  },
  // Ventas
  sales: {
    create: ['admin', 'vendedor', 'cajero'],
    cancel: ['admin', 'cajero'],
    devolution: ['admin', 'cajero'],
  },
  // Stock
  stock: {
    manualAdjustment: ['admin', 'vendedor'],
  },
  // Caja
  cash: {
    open: ['admin', 'cajero'],
    close: ['admin', 'cajero'],
  },
} as const;

type PermissionGroup = keyof typeof PERMISSIONS;
type PermissionAction<G extends PermissionGroup> = keyof (typeof PERMISSIONS)[G];

export function usePermissions() {
  const { profile } = useAuthStore();
  const role = profile?.role as Role | undefined;

  function can<G extends PermissionGroup>(
    group: G,
    action: PermissionAction<G>
  ): boolean {
    if (!role) return false;
    const allowed = PERMISSIONS[group][action] as readonly string[];
    return allowed.includes(role);
  }

  const isAdmin = role === 'admin';
  const isCajero = role === 'cajero';
  const isVendedor = role === 'vendedor';

  return { can, isAdmin, isCajero, isVendedor, role };
}
