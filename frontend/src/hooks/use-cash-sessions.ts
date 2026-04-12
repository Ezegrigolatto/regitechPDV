import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOpenCashSession,
  getCashSessionHistory,
} from '@/services/cash-sessions.service';
import supabase from '../../supabase-config';

export const cashSessionKeys = {
  all: ['cash_sessions'] as const,
  open: (branch_id: string) => [...cashSessionKeys.all, 'open', branch_id] as const,
  history: (branch_id: string) => [...cashSessionKeys.all, 'history', branch_id] as const,
};

export function useOpenCashSession(branch_id: string) {
  return useQuery({
    queryKey: cashSessionKeys.open(branch_id),
    queryFn: () => getOpenCashSession(branch_id),
    enabled: !!branch_id,
    refetchInterval: 1000 * 60,
  });
}

export function useCashSessionHistory(branch_id: string) {
  return useQuery({
    queryKey: cashSessionKeys.history(branch_id),
    queryFn: () => getCashSessionHistory(branch_id),
    enabled: !!branch_id,
  });
}

export function useOpenCashSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { opening_amount: number; reminder_time?: string }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/open-cash-session`,
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
      if (!response.ok) throw new Error(data?.error ?? 'Error al abrir caja');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: cashSessionKeys.open(data.cash_session.branch_id),
      });
      queryClient.invalidateQueries({
        queryKey: cashSessionKeys.history(data.cash_session.branch_id),
      });
    },
  });
}

export function useCloseCashSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { session_id: string; closing_amount: number }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/close-cash-session`,
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
      if (!response.ok) throw new Error(data?.error ?? 'Error al cerrar caja');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: cashSessionKeys.open(data.cash_session.branch_id),
      });
      queryClient.invalidateQueries({
        queryKey: cashSessionKeys.history(data.cash_session.branch_id),
      });
    },
  });
}
