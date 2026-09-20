import { Section } from '@/components/ui/primitives';

const ITEMS = [
  { h: 'The problem', p: 'Environmental information exists, but communities often lack a simple way to translate it into prioritized action. Data sits in separate reports and dashboards, and the people most exposed rarely see it in a form they can act on.' },
  { h: 'Our solution', p: 'EcoPulse combines environmental indicators, spatial visualization, intervention planning and scenario analysis in one workflow. It moves from sensing a problem to measuring whether the fix worked.' },
  { h: 'Why it matters', p: 'The goal is not simply to monitor environmental problems. The goal is to help people decide where to act first, what to do, and how they will know if it worked.' },
];

export function Challenge() {
  return (
    <Section id="about" title="From data to a decision" intro="EcoPulse is a demonstration of a workflow. It runs on simulated data for a fictional district, and it says so wherever numbers appear.">
      <div className="grid gap-8 md:grid-cols-3">
        {ITEMS.map((i) => (
          <div key={i.h} className="border-t-2 border-signal pt-4">
            <h3 className="font-display text-2xl font-semibold">{i.h}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{i.p}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
