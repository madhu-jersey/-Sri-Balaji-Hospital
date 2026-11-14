import { useEffect, useState } from 'react';
import { ArrowUpRight, MapPin, PhoneCall, Star } from 'lucide-react';

type HomeHeroProps = {
  phone: string;
  phoneLabel: string;
  directions: string;
  isOpenAt: (date: Date) => boolean;
};

type Window = { from: number; to: number };
type DayPlan = { hospital: Window; doctor: Window[] };

// Minutes since midnight, Asia/Kolkata. Same facts as the Visit section.
const MON_SAT: DayPlan = { hospital: { from: 570, to: 1230 }, doctor: [{ from: 600, to: 840 }, { from: 1080, to: 1260 }] };
const SUNDAY: DayPlan = { hospital: { from: 600, to: 1200 }, doctor: [] };

// The timeline axis: 8 AM to 10 PM.
const AXIS_START = 480;
const AXIS_END = 1320;
const AXIS_TICKS = [480, 600, 720, 840, 960, 1080, 1200, 1320];

function kolkataNow(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { weekday: get('weekday'), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

function clock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

function axisLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  return `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'pm' : 'am'}`;
}

const pct = (minutes: number) => `${((Math.min(Math.max(minutes, AXIS_START), AXIS_END) - AXIS_START) / (AXIS_END - AXIS_START)) * 100}%`;
const span = (w: Window) => ({ left: pct(w.from), width: `calc(${pct(w.to)} - ${pct(w.from)})` });

// One plain sentence that tells the visitor whether to come now or later.
function describe(plan: DayPlan, tomorrow: DayPlan, now: number, isOpen: boolean) {
  const doctorNow = plan.doctor.find((w) => now >= w.from && now < w.to);
  const doctorNext = plan.doctor.find((w) => now < w.from);
  if (doctorNow) return { lead: 'Doctor is consulting now', rest: `until ${clock(doctorNow.to)}` };
  if (isOpen && doctorNext) return { lead: 'Open now', rest: `· doctor consults from ${clock(doctorNext.from)}` };
  if (isOpen) return { lead: 'Open now', rest: `· closes at ${clock(plan.hospital.to)}` };
  if (now < plan.hospital.from) return { lead: 'Closed now', rest: `· opens today at ${clock(plan.hospital.from)}` };
  return { lead: 'Closed now', rest: `· opens tomorrow at ${clock(tomorrow.hospital.from)}` };
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function TodayBoard({ now, isOpen }: { now: Date; isOpen: boolean }) {
  const { weekday, minutes } = kolkataNow(now);
  const plan = weekday === 'Sunday' ? SUNDAY : MON_SAT;
  const tomorrow = weekday === 'Saturday' ? SUNDAY : MON_SAT;
  const status = describe(plan, tomorrow, minutes, isOpen);
  const showNow = minutes >= AXIS_START && minutes <= AXIS_END;
  const summary = `${weekday}: hospital open ${clock(plan.hospital.from)} to ${clock(plan.hospital.to)}${plan.doctor.length ? `; doctor consults ${plan.doctor.map((w) => `${clock(w.from)} to ${clock(w.to)}`).join(' and ')}` : '; no doctor consultation listed'}.`;

  return (
    <section className="sb-today" aria-labelledby="sb-today-title">
      <div className="sb-today-head">
        <h2 id="sb-today-title">Today at Sri Balaji <span>{weekday}</span></h2>
        <p className={`sb-today-status${isOpen ? ' is-open' : ''}`} aria-live="polite" data-testid="status-open">
          <span className="sb-dot" aria-hidden="true" />
          <strong>{status.lead}</strong> {status.rest}
        </p>
      </div>

      <div className="sb-timeline" role="img" aria-label={summary}>
        <div className="sb-lane">
          <span className="sb-lane-name">Hospital</span>
          <div className="sb-track">
            <span className="sb-bar sb-bar-hospital" style={span(plan.hospital)}>
              <span>{clock(plan.hospital.from)} – {clock(plan.hospital.to)}</span>
            </span>
            {showNow && <span className="sb-now" style={{ left: pct(minutes) }} aria-hidden="true" />}
          </div>
        </div>
        <div className="sb-lane">
          <span className="sb-lane-name">Doctor</span>
          <div className="sb-track">
            {plan.doctor.length ? plan.doctor.map((w) => (
              <span className="sb-bar sb-bar-doctor" style={span(w)} key={w.from}>
                <span>{clock(w.from)} – {clock(w.to)}</span>
              </span>
            )) : <span className="sb-track-note">No consultation listed on Sunday</span>}
            {showNow && <span className="sb-now" style={{ left: pct(minutes) }} aria-hidden="true"><span>Now</span></span>}
          </div>
        </div>
        <div className="sb-lane sb-lane-axis" aria-hidden="true">
          <span className="sb-lane-name" />
          <div className="sb-axis">
            {AXIS_TICKS.map((t) => <span key={t} style={{ left: pct(t) }}>{axisLabel(t)}</span>)}
          </div>
        </div>
      </div>

      <dl className="sb-today-list">
        <div><dt>Hospital</dt><dd>{clock(plan.hospital.from)} – {clock(plan.hospital.to)}</dd></div>
        <div><dt>Doctor</dt><dd>{plan.doctor.length ? plan.doctor.map((w) => `${clock(w.from)} – ${clock(w.to)}`).join(', ') : 'Not listed today'}</dd></div>
      </dl>
    </section>
  );
}

export function HomeHero({ phone, phoneLabel, directions, isOpenAt }: HomeHeroProps) {
  const now = useNow();
  const isOpen = isOpenAt(now);

  return (
    <section className="sb-hero" id="home" aria-labelledby="hero-title">
      <div className="container sb-hero-grid">
        <div className="sb-hero-copy">
          <h1 id="hero-title">Sri Balaji Hospital</h1>
          <p className="sb-hero-telugu font-telugu" lang="te" data-testid="text-hospital-name-telugu">శ్రీ బాలాజీ హాస్పిటల్</p>
          <p className="sb-hero-lede">General medicine and anaesthesia care in Sajjapuram, led by Dr. Billygraham Deepati, MD. Open seven days a week.</p>

          <div className="sb-actions">
            <a className="sb-action sb-action-call" href={`tel:${phone}`} data-testid="button-call-hero">
              <span className="sb-action-icon"><PhoneCall size={22} strokeWidth={1.8} aria-hidden="true" /></span>
              <span className="sb-action-text">
                <span className="sb-action-label">Call the hospital</span>
                <span className="sb-action-value">{phoneLabel}</span>
              </span>
            </a>
            <a className="sb-action sb-action-map" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions">
              <span className="sb-action-icon"><MapPin size={22} strokeWidth={1.8} aria-hidden="true" /></span>
              <span className="sb-action-text">
                <span className="sb-action-label">Get directions</span>
                <span className="sb-action-value sb-action-value-sm">Sajjapuram, AP 534211</span>
              </span>
              <ArrowUpRight className="sb-action-arrow" size={18} aria-hidden="true" />
            </a>
          </div>

          <a className="sb-rating" href="#reviews">
            <Star size={16} strokeWidth={0} fill="currentColor" aria-hidden="true" />
            <strong>3.8</strong> on Google · 38 reviews
          </a>
        </div>

        <figure className="sb-hero-photo">
          <img
            src="/assets/hero-sri-balaji-building.webp"
            alt="Sri Balaji Hospital building with its rooftop Telugu name board"
            width="934"
            height="1685"
            fetchPriority="high"
          />
        </figure>
      </div>

      <div className="container">
        <TodayBoard now={now} isOpen={isOpen} />
      </div>
    </section>
  );
}
