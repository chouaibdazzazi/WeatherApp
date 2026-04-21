// services/weather-service.ts
import type { WeatherData } from "@/types/weather";
import { ForecastDay } from "@/types/weather";

const API_KEY = "9cbebc15db44fabaf8654eb7a5cf3af0";

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`,
  );

  if (!res.ok) {
    throw new Error(`Erreur API météo: ${res.status} ${res.statusText}`);
  }

  const data: WeatherData = await res.json();
  return data;
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=fr`,
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Erreur API météo ville: ${res.status}`,
    );
  }

  const data: WeatherData = await res.json();
  return data;
}

export type { ForecastDay } from '@/types/weather';

export async function fetchForecast(
  lat: number,
  lon: number,
): Promise<ForecastDay[]> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr&cnt=56`, // 7 days * 8
  );

  if (!res.ok) {
    throw new Error(`Erreur API prévisions: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const daily =
    data.list?.filter((_: any, i: number) => i % 8 === 0).slice(0, 7) || [];
  return daily.map(
    (item: any): ForecastDay => ({
      dt: item.dt,
      main: item.main,
      weather: item.weather,
    }),
  );
}
