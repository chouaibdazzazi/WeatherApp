// services/location-service.ts
import type { LocationCoords } from "@/types/weather";
import * as Location from "expo-location";

export async function getUserLocation(): Promise<LocationCoords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission de localisation refusée");
  }

  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}
