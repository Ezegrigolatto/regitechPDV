import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOpenTickets,
  getTicketById,
  createTicket,
  updateTicket,
  discardTicket,
  type Ticket,
} from '@/services/tickets.service';

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  open: (branch_id: string) => [...ticketKeys.lists(), 'open', branch_id] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
};

export function useOpenTickets(branch_id: string) {
  return useQuery({
    queryKey: ticketKeys.open(branch_id),
    queryFn: () => getOpenTickets(branch_id),
    enabled: !!branch_id,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getTicketById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.open(data.branch_id),
      });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ticket }: { id: string; ticket: Partial<Ticket> }) =>
      updateTicket(id, ticket),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.open(data.branch_id),
      });
      queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(data.id),
      });
    },
  });
}

export function useDiscardTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: discardTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.open(data.branch_id),
      });
    },
  });
}