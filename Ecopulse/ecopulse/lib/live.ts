/**
 * Optional live lookup against Open-Meteo (free, no API key, browser-callable).
 * Air quality values are modelled grid data, not station readings.
 */
export interface Place { name: string; country?: string; admin?: string; lat: number; lon: number }
export interface LiveReading {
  place: Place;
  pm25: number | null;
  pm10: number | null;
  usAqi: number | null;
  temp: number | null;
  feelsLike: number | null;
  airTime: string | null;
  weatherTime: string | null;
}

async function getJson(url: string, ms = 8000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function geocode(name: string): Promise<Place[]> {
  const data = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json`);
  return (data.results ?? []).map((r: any) => ({ name: r.name, country: r.country, admin: r.admin1, lat: r.latitude, lon: r.longitude }));
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export async function fetchLive(place: Place): Promise<LiveReading> {
  const { lat, lon } = place;
  const [air, wx] = await Promise.allSettled([
    getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi&timezone=auto`),
    getJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature&timezone=auto`),
  ]);
  if (air.status === 'rejected' && wx.status === 'rejected') throw new Error('Both requests failed');
  const a = air.status === 'fulfilled' ? air.value.current ?? {} : {};
  const w = wx.status === 'fulfilled' ? wx.value.current ?? {} : {};
  return {
    place,
    pm25: num(a.pm2_5), pm10: num(a.pm10), usAqi: num(a.us_aqi),
    temp: num(w.temperature_2m), feelsLike: num(w.apparent_temperature),
    airTime: typeof a.time === 'string' ? a.time : null,
    weatherTime: typeof w.time === 'string' ? w.time : null,
  };
}

// ---------- Regional sampling: six real points, one per demo district ----------
import { DISTRICTS, REGION } from '@/data/districts';

export const REGION_SPAN_KM = 50;

/** Centre of a district polygon in SVG coordinates. */
export function districtCenter(points: string): [number, number] {
  const pts = points.split(' ').map((p) => p.split(',').map(Number));
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

export interface LivePoint {
  districtId: string;
  lat: number;
  lon: number;
  pm25: number | null;
  usAqi: number | null;
  feelsLike: number | null;
}
export interface RegionalLive {
  place: Place;
  spanKm: number;
  points: LivePoint[];
  time: string | null;
}

/** Lay the 800x560 demo map over a real area centred on the place, and return one lat/lon per district. */
export function samplePoints(place: Place, spanKm = REGION_SPAN_KM) {
  const dLat = spanKm / 111;
  const dLon = spanKm / (111 * Math.cos((place.lat * Math.PI) / 180));
  return DISTRICTS.map((d) => {
    const [x, y] = districtCenter(d.points);
    return {
      districtId: d.id,
      lat: Math.round((place.lat - (y / REGION.height - 0.5) * dLat) * 1000) / 1000,
      lon: Math.round((place.lon + (x / REGION.width - 0.5) * dLon) * 1000) / 1000,
    };
  });
}

const asArray = (data: any, n: number): any[] => {
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length !== n) throw new Error('Unexpected response shape');
  return arr;
};

export async function fetchRegional(place: Place): Promise<RegionalLive> {
  const pts = samplePoints(place);
  const lat = pts.map((p) => p.lat).join(',');
  const lon = pts.map((p) => p.lon).join(',');
  const [air, wx] = await Promise.allSettled([
    getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,us_aqi&timezone=auto`),
    getJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=apparent_temperature&timezone=auto`),
  ]);
  if (air.status === 'rejected' && wx.status === 'rejected') throw new Error('Both requests failed');
  const a = air.status === 'fulfilled' ? asArray(air.value, pts.length) : null;
  const w = wx.status === 'fulfilled' ? asArray(wx.value, pts.length) : null;
  const time = (a?.[0]?.current?.time ?? w?.[0]?.current?.time ?? null) as string | null;
  return {
    place,
    spanKm: REGION_SPAN_KM,
    time,
    points: pts.map((p, i) => ({
      ...p,
      pm25: num(a?.[i]?.current?.pm2_5),
      usAqi: num(a?.[i]?.current?.us_aqi),
      feelsLike: num(w?.[i]?.current?.apparent_temperature),
    })),
  };
}
