import { useState, useRef, useEffect } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCustomers, useCreateCustomer } from '@/hooks/use-customers';
import { CustomerDrawer } from './customer-drawer';
import type { Customer } from '@/services/customers.service';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export function CustomerSelector({ selectedCustomer, onSelect }: CustomerSelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: customers = [] } = useCustomers({ is_active: true });
  const createCustomer = useCreateCustomer();

  const filtered = query.trim().length === 0
    ? []
    : customers.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.full_name.toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q) ||
          (c.tax_id ?? '').toLowerCase().includes(q)
        );
      }).slice(0, 6);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
  };

  const handleCreateCustomer = async (data: Partial<Customer>) => {
    const created = await createCustomer.mutateAsync(data as any);
    onSelect(created);
    setCreateOpen(false);
  };

  if (selectedCustomer) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/30">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{selectedCustomer.full_name}</p>
          {selectedCustomer.tax_id && (
            <p className="text-[11px] text-muted-foreground font-mono">
              {selectedCustomer.tax_id}
            </p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div ref={ref} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-10 pr-24"
            placeholder="Buscar cliente..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => query.trim().length > 0 && setOpen(true)}
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-xs text-primary hover:text-primary"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Nuevo
          </Button>
        </div>

        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-xl shadow-lg overflow-hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-4 text-sm text-muted-foreground text-center">
                No se encontraron clientes
              </div>
            ) : (
              <ul>
                {filtered.map((customer) => (
                  <li
                    key={customer.id}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-0"
                    onClick={() => handleSelect(customer)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{customer.full_name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {customer.tax_id && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {customer.tax_id}
                          </span>
                        )}
                        {customer.email && (
                          <span className="text-[11px] text-muted-foreground">
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Drawer crear cliente — se mantiene abierto sin cerrar nada */}
      <CustomerDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateCustomer}
        mode="create"
        isLoading={createCustomer.isPending}
      />
    </>
  );
}