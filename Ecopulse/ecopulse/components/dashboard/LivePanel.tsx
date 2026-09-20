'use client';

import { useState, type FormEvent } from 'react';
import { CURRENT } from '@/data/indicators';
import { fetchLive, fetchRegional, geocode, REGION_SPAN_KM, type LiveReading, type Place } from '@/lib/live';
import { useStore } from '@/components/Providers';
import { scrollToId } from '@/lib/scroll';
import { WHO_PM25_24H, STATUS, airScoreFromPm25, heatScoreFromApparent, statusOf } from '@/lib/scoring';
import { Panel, StatusBadge } from '@/components/ui/primitives';

const QUICK = ['Lahore', 'Nairobi', 'Rotterdam', 'Lima'];

function Tile({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  return (
    <div className="rounded bg-mist p-3">
      <dt className="text-xs text-ink-mute">{label}</dt>
      <dd className="mt-0.5 text-2xl font-semibold tabular-nums">{value}<span className="ml-1 text-sm font-normal text-ink-mute">{unit}</span></dd>
      {note && <dd className="mt-0.5 text-xs text-ink-soft">{note}</dd>}
    </div>
  );
}

export function LivePanel() {
  const [q, setQ] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [reading, setReading] = useState<LiveReading | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { regional, setRegional, setLayer } = useStore();
  const [mapping, setMapping] = useState(false);

  async function mapRegion(p: Place) {
    setMapping(true); setMsg(null);
    try {
      setRegional(await fetchRegional(p));
      setLayer('air');
      setTimeout(() => scrollToId('map'), 100);
    } catch {
      setMsg('Could not build the live regional view. Check the connection and try again.');
    } finally {
      setMapping(false);
    }
  }

  async function load(p: Place) {
    setBusy(true); setMsg(null); setPlaces([]);
    try {
      setReading(await fetchLive(p));
    } catch {
      setReading(null);
      setMsg('Could not reach Open-Meteo. Check the connection and try again. The rest of EcoPulse works offline.');
    } finally {
      setBusy(false);
    }
  }

  async function search(name: string) {
    const term = name.trim();
    if (!term) return;
    setBusy(true); setMsg(null); setPlaces([]);
    try {
      const found = await geocode(term);
      if (found.length === 0) { setMsg(`No place found for "${term}".`); setBusy(false); return; }
      if (found.length === 1) { await load(found[0]); return; }
      setPlaces(found); setBusy(false);
    } catch {
      setMsg('Could not reach Open-Meteo. Check the connection and try again. The rest of EcoPulse works offline.');
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); search(q); };
  const airScore = reading?.pm25 != null ? airScoreFromPm25(reading.pm25) : null;
  const heatScore = reading?.feelsLike != null ? heatScoreFromApparent(reading.feelsLike) : null;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-xl font-semibold">Reality check with live data</h3>
        <span className="rounded bg-signal/10 px-2 py-0.5 text-xs font-semibold text-signal">Real data, optional</span>
      </div>
      <p className="mt-1 max-w-3xl text-sm text-ink-soft">
        The demo district is simulated. To see how the same 0-100 scoring behaves on real conditions, look up any place. Your browser asks Open-Meteo directly for current values. Nothing is stored and the demo district is not changed.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap gap-2">
        <label htmlFor="live-q" className="sr-only">Place name</label>
        <input id="live-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a city" className="min-w-0 flex-1 rounded border border-line bg-white px-3 py-2 text-sm sm:max-w-xs" />
        <button type="submit" disabled={busy || !q.trim()} className="rounded bg-deep px-4 py-2 text-sm font-semibold text-white hover:bg-deep-2 disabled:opacity-50">Look up</button>
        <span className="flex flex-wrap items-center gap-1.5 text-xs text-ink-mute">
          Try
          {QUICK.map((c) => (
            <button key={c} type="button" disabled={busy} onClick={() => { setQ(c); search(c); }} className="rounded border border-line px-2 py-1 font-medium text-ink-soft hover:bg-mist disabled:opacity-50">{c}</button>
          ))}
        </span>
      </form>

      <div aria-live="polite" className="mt-4">
        {busy && <p className="text-sm text-ink-soft">Fetching current values...</p>}
        {msg && <p className="text-sm text-[#9C1F16]">{msg}</p>}
        {places.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {places.map((p) => (
              <li key={`${p.lat}-${p.lon}`}>
                <button type="button" onClick={() => load(p)} className="w-full rounded border border-line px-3 py-2 text-left text-sm hover:bg-mist">
                  <span className="font-medium">{p.name}</span> <span className="text-ink-mute">{[p.admin, p.country].filter(Boolean).join(', ')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reading && (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="font-semibold">{reading.place.name}{reading.place.country ? `, ${reading.place.country}` : ''}</h4>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Tile label="PM2.5" value={reading.pm25 != null ? reading.pm25.toFixed(1) : 'n/a'} unit="µg/m³" note={reading.pm25 != null ? `${(reading.pm25 / WHO_PM25_24H).toFixed(1)} times the WHO 24-hour guideline (${WHO_PM25_24H})` : undefined} />
              <Tile label="US AQI" value={reading.usAqi != null ? String(Math.round(reading.usAqi)) : 'n/a'} />
              <Tile label="Temperature" value={reading.temp != null ? reading.temp.toFixed(1) : 'n/a'} unit="°C" />
              <Tile label="Feels like" value={reading.feelsLike != null ? reading.feelsLike.toFixed(1) : 'n/a'} unit="°C" />
            </dl>
            <div className="mt-4 rounded border border-signal/40 bg-signal/5 p-3 text-sm">
              <p className="font-semibold">Put this place on the map</p>
              <p className="mt-1 text-ink-soft">Samples six real points spread across about {REGION_SPAN_KM} km around {reading.place.name}, one per demo district, and colours the Air quality and Heat layers with the real values.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={mapping} onClick={() => mapRegion(reading.place)} className="rounded bg-signal px-3 py-1.5 font-semibold text-white hover:bg-[#085E5A] disabled:opacity-50">{mapping ? 'Sampling...' : 'Map this region live'}</button>
                {regional && <button type="button" onClick={() => setRegional(null)} className="rounded border border-line bg-white px-3 py-1.5 font-semibold hover:bg-mist">Clear live map data</button>}
              </div>
              {regional && <p className="mt-2 text-xs text-ink-mute">Live map data is active for {regional.place.name}.</p>}
            </div>
            <p className="mt-3 text-xs text-ink-mute">
              Source: Open-Meteo. Air quality values are modelled grid data, not a station reading. Observation time, local to the place: {reading.airTime ?? reading.weatherTime ?? 'not provided'}.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">The same scoring applied to this place</h4>
            <table className="mt-3 w-full text-sm">
              <thead><tr className="border-b border-line text-left text-ink-mute"><th scope="col" className="py-2 font-medium">Indicator</th><th scope="col" className="py-2 font-medium">{reading.place.name}</th><th scope="col" className="py-2 font-medium">Demo district</th></tr></thead>
              <tbody>
                {([['Air quality', airScore, CURRENT.air], ['Heat risk', heatScore, CURRENT.heat]] as const).map(([label, live, demo]) => (
                  <tr key={label} className="border-b border-line/70">
                    <th scope="row" className="py-2.5 text-left font-normal">{label}</th>
                    <td className="py-2.5">{live != null ? <span className="flex items-center gap-2"><span className="text-lg font-semibold tabular-nums" style={{ color: STATUS[statusOf(live)].text }}>{live}</span><StatusBadge status={statusOf(live)} /></span> : 'n/a'}</td>
                    <td className="py-2.5"><span className="flex items-center gap-2"><span className="text-lg font-semibold tabular-nums">{Math.round(demo)}</span><StatusBadge status={statusOf(demo)} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-ink-mute">
              Mapping (demonstration): air score = 100 at PM2.5 of 5 µg/m³ or lower, falling linearly to 0 at 75. Heat score uses feels-like temperature, 100 at 24 °C or lower, 0 at 42 °C or higher. These are illustrative bands, not standards. Only air and heat are shown because these are the two indicators Open-Meteo can supply.
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}
