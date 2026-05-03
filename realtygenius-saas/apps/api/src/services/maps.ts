import { env } from "../config/env.js";

export type RouteStop = {
  propertyId: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

function distanceKm(a: RouteStop, b: RouteStop) {
  if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 8;
  const earthKm = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLng = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const haversine = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function malaysiaTrafficMultiplier(startAt?: string) {
  const date = startAt ? new Date(startAt) : new Date();
  const hour = date.getHours();
  const day = date.getDay();
  let multiplier = 1.12;

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) multiplier += 0.3;
  if (day === 6 && hour >= 11 && hour <= 16) multiplier += 0.22;
  if (day === 0 && hour >= 12 && hour <= 18) multiplier += 0.12;

  return multiplier;
}

function fallbackRoute(stops: RouteStop[], startAt?: string) {
  const remaining = [...stops];
  const ordered: Array<RouteStop & { order: number; travelMinutes: number }> = [];
  let current = remaining.shift();
  let totalTravelMinutes = 0;

  if (!current) return { orderedStops: [], provider: "malaysia_traffic_fallback", totalTravelMinutes: 0 };

  ordered.push({ ...current, order: 1, travelMinutes: 0 });

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((stop, index) => {
      const distance = distanceKm(current!, stop);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    const next = remaining.splice(bestIndex, 1)[0];
    const travelMinutes = Math.max(12, Math.round(((bestDistance / 28) * 60) * malaysiaTrafficMultiplier(startAt) + 7));
    totalTravelMinutes += travelMinutes;
    ordered.push({ ...next, order: ordered.length + 1, travelMinutes });
    current = next;
  }

  return {
    orderedStops: ordered,
    provider: "malaysia_traffic_fallback",
    totalTravelMinutes
  };
}

export async function optimizeViewingRoute(stops: RouteStop[], startAt?: string) {
  if (!env.GOOGLE_MAPS_API_KEY || stops.length < 2) {
    return fallbackRoute(stops, startAt);
  }

  const origin = encodeURIComponent(stops[0].address);
  const destination = encodeURIComponent(stops[stops.length - 1].address);
  const waypoints = stops.slice(1, -1).map((stop) => encodeURIComponent(stop.address)).join("|");
  const departureTime = Math.max(Math.floor((startAt ? new Date(startAt) : new Date()).getTime() / 1000), Math.floor(Date.now() / 1000));
  const waypointParam = waypoints ? `&waypoints=optimize:true|${waypoints}` : "";
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypointParam}&departure_time=${departureTime}&traffic_model=best_guess&region=my&key=${env.GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const json = await response.json() as {
    status?: string;
    routes?: Array<{
      waypoint_order?: number[];
      legs?: Array<{ duration?: { value?: number }; duration_in_traffic?: { value?: number } }>;
    }>;
  };
  const route = json.routes?.[0];
  if (!response.ok || json.status !== "OK" || !route) return fallbackRoute(stops, startAt);

  const waypointOrder: number[] = route?.waypoint_order || [];
  const middle = waypointOrder.map((index) => stops[index + 1]);
  const ordered = [stops[0], ...middle, stops[stops.length - 1]];
  const legs = route?.legs || [];

  return {
    orderedStops: ordered.map((stop, index) => ({
      ...stop,
      order: index + 1,
      travelMinutes: index === 0 ? 0 : Math.round((legs[index - 1]?.duration_in_traffic?.value || legs[index - 1]?.duration?.value || 1200) / 60)
    })),
    provider: "google_maps",
    totalTravelMinutes: legs.reduce((sum: number, leg: { duration?: { value?: number }; duration_in_traffic?: { value?: number } }) => (
      sum + Math.round((leg.duration_in_traffic?.value || leg.duration?.value || 0) / 60)
    ), 0)
  };
}
