// hooks/use-forecast.ts

import { getUserLocation } from "@/services/location-service";
import { fetchForecast, type ForecastDay } from "@/services/weather-service";
import { useEffect, useState } from "react";

export function useForecast() {
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      setError(null);
      const { latitude, longitude } = await getUserLocation();
      const data = await fetchForecast(latitude, longitude);
      setForecast(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue est survenue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { forecast, loading, error, refetch: loadForecast };
}
