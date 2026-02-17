import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          quality_assessments(*),
          fraud_alerts(*),
          weekly_earnings(*)
        `)
        .eq('user_id', user.id)
        .order('posted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};