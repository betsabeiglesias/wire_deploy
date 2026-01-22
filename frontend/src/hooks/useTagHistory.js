// frontend/src/hooks/useTagHistory.js
import { useEffect, useState } from 'react';
import { scadaService } from '../services/scadaService';

export function useTagHistory(equipmentId, variable, options = {}) {
  const {
    start = '-12h',
    window = '30s',
    refreshInterval = 10000,
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !equipmentId || !variable) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const response = await scadaService.getTagHistory(
          equipmentId,
          variable,
          { start, window }
        );

        const formatted = response.data.map(point => ({
          time: new Date(point.time).toLocaleTimeString(),
          timestamp: new Date(point.time),
          value: point.value,
        }));

        setData(formatted);
        setError(null);
      } catch (err) {
        console.error('Error fetching tag history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [equipmentId, variable, start, window, refreshInterval, enabled]);

  return { data, loading, error };
}