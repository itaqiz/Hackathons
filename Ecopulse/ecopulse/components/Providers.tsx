'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CommunityAction, Hotspot, IndicatorId, Intervention, LeverId, Period, Plan } from '@/lib/types';
import { HOTSPOT_BY_ID, TOP_HOTSPOT } from '@/data/hotspots';
import { INTERVENTION_BY_ID } from '@/data/interventions';
import { COMMUNITY_ACTIONS } from '@/data/actions';
import { ZERO_LEVERS } from '@/data/scenarios';
import { defaultPlan } from '@/lib/plan';
import { scrollToId } from '@/lib/scroll';
import { JUDGE_STEPS } from '@/lib/judge';
import type { RegionalLive } from '@/lib/live';

type Levers = Record<LeverId, number>;

interface Store {
  period: Period;
  setPeriod: (p: Period) => void;
  layer: IndicatorId;
  setLayer: (l: IndicatorId) => void;
  selectedIndicator: IndicatorId;
  setSelectedIndicator: (i: IndicatorId) => void;
  hotspotId: string | null;
  activeHotspot: Hotspot;
  selectHotspot: (id: string | null) => void;
  interventionId: string | null;
  selectedIntervention: Intervention | null;
  selectIntervention: (id: string | null) => void;
  levers: Levers;
  setLever: (id: LeverId, v: number) => void;
  loadIntervention: (i: Intervention | null) => void;
  resetLevers: () => void;
  actions: CommunityAction[];
  joined: string[];
  logProgress: (id: string) => void;
  toggleJoin: (id: string) => void;
  plans: Plan[];
  createPlan: (p: Omit<Plan, 'id'>) => void;
  resetDemo: () => void;
  planModalOpen: boolean;
  setPlanModalOpen: (o: boolean) => void;
  transparencyOpen: boolean;
  setTransparencyOpen: (o: boolean) => void;
  judge: { open: boolean; step: number };
  startJudge: () => void;
  closeJudge: () => void;
  goStep: (n: number) => void;
  toast: string | null;
  regional: RegionalLive | null;
  setRegional: (l: RegionalLive | null) => void;
}

const Ctx = createContext<Store | null>(null);
const STORAGE_KEY = 'ecopulse-demo-v1';

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be used inside Providers');
  return c;
}

export function Providers({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>('90d');
  const [layer, setLayer] = useState<IndicatorId>('heat');
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorId>('heat');
  const [hotspotId, setHotspotId] = useState<string | null>(null);
  const [interventionId, setInterventionId] = useState<string | null>(null);
  const [levers, setLevers] = useState<Levers>({ ...ZERO_LEVERS });
  const [actions, setActions] = useState<CommunityAction[]>(COMMUNITY_ACTIONS);
  const [joined, setJoined] = useState<string[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [judge, setJudge] = useState({ open: false, step: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [regional, setRegional] = useState<RegionalLive | null>(null);

  const live = useRef({ hotspotId, interventionId, plans, joined });
  live.current = { hotspotId, interventionId, plans, joined };

  // Restore locally saved plans and progress (browser storage only, never sent anywhere).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.actions)) setActions(saved.actions);
        if (Array.isArray(saved.plans)) setPlans(saved.plans);
        if (Array.isArray(saved.joined)) setJoined(saved.joined);
      }
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ actions, plans, joined }));
    } catch {
      /* storage may be unavailable */
    }
  }, [actions, plans, joined, hydrated]);

  const toastTimer = useRef<number>();
  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const selectHotspot = useCallback((id: string | null) => {
    setHotspotId(id);
    if (id) {
      const h = HOTSPOT_BY_ID[id];
      setLayer(h.layer);
      setSelectedIndicator(h.layer);
    }
    setInterventionId((cur) => {
      if (!id || !cur) return null;
      return INTERVENTION_BY_ID[cur]?.layer === HOTSPOT_BY_ID[id].layer ? cur : null;
    });
  }, []);

  const loadIntervention = useCallback((i: Intervention | null) => {
    if (!i?.lever) return;
    setLevers({ ...ZERO_LEVERS, [i.lever.id]: i.lever.amount });
  }, []);

  const createPlan = useCallback(
    (p: Omit<Plan, 'id'>) => {
      const id = `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const h = HOTSPOT_BY_ID[p.hotspotId];
      const i = INTERVENTION_BY_ID[p.interventionId];
      setPlans((prev) => [...prev, { ...p, id }]);
      setActions((prev) => [
        ...prev,
        {
          id,
          title: p.title,
          layer: h.layer,
          districtId: h.districtId,
          participants: 0,
          status: 'Planning',
          target: Math.max(1, p.target - p.baseline),
          current: 0,
          unit: 'score points gained',
          step: 1,
          note: `${i.name}. Progress is logged manually against the ${p.cadence.toLowerCase()} monitoring check.`,
          fromPlan: true,
        },
      ]);
      notify('Action plan created. It is now on the community board.');
    },
    [notify],
  );

  const logProgress = useCallback((id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, current: Math.min(a.target, a.current + a.step) } : a)));
  }, []);

  const toggleJoin = useCallback((id: string) => {
    const isIn = live.current.joined.includes(id);
    setJoined((prev) => (isIn ? prev.filter((x) => x !== id) : [...prev, id]));
    setActions((acts) => acts.map((a) => (a.id === id ? { ...a, participants: Math.max(0, a.participants + (isIn ? -1 : 1)) } : a)));
  }, []);

  const resetDemo = useCallback(() => {
    setActions(COMMUNITY_ACTIONS);
    setPlans([]);
    setJoined([]);
    setLevers({ ...ZERO_LEVERS });
    setHotspotId(null);
    setInterventionId(null);
    notify('Demo state reset.');
  }, [notify]);

  const runStep = useCallback(
    (n: number) => {
      const later = (fn: () => void, ms = 80) => window.setTimeout(fn, ms);
      const iv = INTERVENTION_BY_ID['canopy'];
      switch (n) {
        case 0: setPlanModalOpen(false); scrollToId('overview'); break;
        case 1: scrollToId('pulse'); break;
        case 2: setLayer('heat'); later(() => scrollToId('map')); break;
        case 3: selectHotspot(TOP_HOTSPOT.id); break;
        case 4: later(() => scrollToId('hotspot-detail')); break;
        case 5: later(() => scrollToId('planner')); break;
        case 6: selectHotspot(TOP_HOTSPOT.id); setInterventionId(iv.id); break;
        case 7: setInterventionId(iv.id); loadIntervention(iv); later(() => scrollToId('simulator')); break;
        case 8: setLevers({ ...ZERO_LEVERS, canopy: 18 }); break;
        case 9: later(() => scrollToId('scenario-results')); break;
        case 10: later(() => scrollToId('planner')); setPlanModalOpen(true); break;
        case 11: {
          const { hotspotId: hid, interventionId: iid, plans: current } = live.current;
          const h = HOTSPOT_BY_ID[hid ?? TOP_HOTSPOT.id];
          const i = INTERVENTION_BY_ID[iid ?? 'canopy'];
          if (!current.some((p) => p.hotspotId === h.id && p.interventionId === i.id)) createPlan(defaultPlan(h, i));
          setPlanModalOpen(false);
          later(() => scrollToId('community'), 150);
          break;
        }
      }
    },
    [selectHotspot, loadIntervention, createPlan],
  );

  const goStep = useCallback(
    (n: number) => {
      const step = Math.max(0, Math.min(JUDGE_STEPS.length - 1, n));
      setJudge({ open: true, step });
      runStep(step);
    },
    [runStep],
  );
  const startJudge = useCallback(() => goStep(0), [goStep]);
  const closeJudge = useCallback(() => setJudge((j) => ({ ...j, open: false })), []);

  const value = useMemo<Store>(
    () => ({
      period, setPeriod, layer, setLayer, selectedIndicator, setSelectedIndicator,
      hotspotId, activeHotspot: (hotspotId && HOTSPOT_BY_ID[hotspotId]) || TOP_HOTSPOT, selectHotspot,
      interventionId, selectedIntervention: interventionId ? INTERVENTION_BY_ID[interventionId] ?? null : null,
      selectIntervention: setInterventionId,
      levers, setLever: (id, v) => setLevers((l) => ({ ...l, [id]: v })), loadIntervention,
      resetLevers: () => setLevers({ ...ZERO_LEVERS }),
      actions, joined, logProgress, toggleJoin, plans, createPlan, resetDemo,
      planModalOpen, setPlanModalOpen, transparencyOpen, setTransparencyOpen,
      judge, startJudge, closeJudge, goStep, toast, regional, setRegional,
    }),
    [period, layer, selectedIndicator, hotspotId, interventionId, levers, actions, joined, plans, planModalOpen, transparencyOpen, judge, toast, regional,
      selectHotspot, loadIntervention, logProgress, toggleJoin, createPlan, resetDemo, startJudge, closeJudge, goStep],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
