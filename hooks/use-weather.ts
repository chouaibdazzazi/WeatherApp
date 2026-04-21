// hooks/use-weather.ts

import { getUserLocation } from "@/services/location-service";
import { fetchWeather } from "@/services/weather-service";
import type { WeatherData } from "@/types/weather";
import { useEffect, useState } from "react";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setError(null);
      const { latitude, longitude } = await getUserLocation();
      const data = await fetchWeather(latitude, longitude);
      setWeather(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue est survenue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, error, refetch: loadWeather };
}
