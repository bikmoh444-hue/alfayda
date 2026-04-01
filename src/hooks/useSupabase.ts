import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSupabase<T>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const { data: results, error: err } = await supabase
        .from(tableName)
        .select('*')
        .order('date', { ascending: false });

      if (err) throw err;
      setData(results as T[]);
    } catch (err: any) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`${tableName}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [tableName]);

  return { data, loading, error, refresh: fetchData };
}
