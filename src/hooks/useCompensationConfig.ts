import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { DEFAULT_LEVELS, DEFAULT_WITHDRAWALS, type LevelConfig, type WithdrawalConfig } from '@/lib/compensation-defaults';

function useAdminSettingPublic<T>(key: string, fallback: T) {
  return useQuery({
    queryKey: ['admin_settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', key)
        .single();
      if (error) return fallback;
      try { return JSON.parse(data.value) as T; } catch { return fallback; }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLevelConfig() {
  return useAdminSettingPublic<LevelConfig[]>('level_config', DEFAULT_LEVELS);
}

export function useWithdrawalConfig() {
  return useAdminSettingPublic<WithdrawalConfig[]>('withdrawal_config', DEFAULT_WITHDRAWALS);
}
