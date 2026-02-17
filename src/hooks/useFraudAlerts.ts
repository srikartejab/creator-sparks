import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFraudAlerts = () => {
  return useQuery({
    queryKey: ['fraudAlerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          posts:post_id(title, user_id, views_count, total_earnings)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const usePostFraudAlerts = (postId: string) => {
  return useQuery({
    queryKey: ['fraudAlerts', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};