import { Plus, X } from 'lucide-react';
import { useVentasStore } from '@/stores/ventas.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

export function TicketTabs() {
  const { tickets, activeTicketId, addTicket, removeTicket, setActiveTicket } =
    useVentasStore();
  const { profile } = useAuthStore();

  return (
    <div className="flex items-center gap-2 border-b pb-0">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-t-lg border border-b-0 cursor-pointer transition-colors text-sm font-semibold select-none',
            activeTicketId === ticket.id
              ? 'bg-background text-foreground border-border'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
          onClick={() => setActiveTicket(ticket.id)}
        >
          <span>{ticket.label}</span>
          {ticket.items.length > 0 && (
            <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
              {ticket.items.length}
            </span>
          )}
          <button
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              removeTicket(ticket.id);
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {tickets.length < 5 && (
        <button
          className="flex items-center gap-1 px-3 py-2.5 rounded-t-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm"
          onClick={() =>
            addTicket(
              profile?.branch_id ?? '',
              profile?.id ?? ''
            )
          }
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo</span>
        </button>
      )}
    </div>
  );
}