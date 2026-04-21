// hooks/use-city-weather.ts

import { fetchWeatherByCity } from "@/services/weather-service";
import type { WeatherData } from "@/types/weather";
import { useEffect, useState } from "react";

interface UseCityWeatherProps {
  city?: string | null;
}

export function useCityWeather({ city }: UseCityWeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) {
      setWeather(null);
      setError(null);
      return;
    }

    loadCityWeather(city);
  }, [city]);

  const loadCityWeather = async (searchCity: string) => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchWeatherByCity(searchCity);
      setWeather(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ville non trouvée";
      setError(errorMessage);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, error, search: loadCityWeather };
}
