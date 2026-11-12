import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, MapPin, PhoneCall, Siren, Star, Stethoscope } from 'lucide-react';

type HomeHeroProps = {
  phone: string;
  phoneLabel: string;
  directions: string;
  isOpenAt: (date: Date) => boolean;
};

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

// Line-art symbols drawn on a 120 x 120 grid; every path uses pathLength 1 so the panel can draw them on.
function MedicineSymbol() {
  return (
    <svg className="vh-spec-symbol" viewBox="0 0 120 120" aria-hidden="true">
      {/* Stethoscope: ear tips, tubing down to the chest piece */}
      <path pathLength="1" d="M30 14v26a22 22 0 0 0 44 0V14" />
      <path pathLength="1" d="M24 14h12M68 14h12" />
      <path pathLength="1" d="M52 62v12a24 24 0 0 0 48 0V66" />
      <circle className="vh-spec-accent" pathLength="1" cx="100" cy="56" r="10" />
    </svg>
  );
}

function AnaesthesiaSymbol() {
  return (
    <svg className="vh-spec-symbol" viewBox="0 0 120 120" aria-hidden="true">
      {/* Patient monitor with a heartbeat trace */}
      <rect pathLength="1" x="14" y="20" width="92" height="64" rx="10" />
      <path pathLength="1" d="M48 84v14M72 84v14M38 100h44" />
      <path className="vh-spec-accent" pathLength="1" d="M24 54h16l6-14 10 28 8-20 5 6h27" />
    </svg>
  );
}

type Speciality = {
  id: string;
  title: string;
  doctor: string;
  degree: string;
  areas: string[];
  href: string;
  symbol: ReactNode;
};

// Doctor details and areas of care match DoctorsSection.
const specialities: Speciality[] = [
  {
    id: 'general-medicine',
    title: 'General Medicine',
    doctor: 'Dr. Billygraham Deepati',
    degree: 'MD (General Medicine)',
    areas: ['Viral fever treatment', 'Chest and abdominal pain'],
    href: '#doctor-billygraham',
    symbol: <MedicineSymbol />,
  },
  {
    id: 'anaesthesiology',
    title: 'Anaesthesiology',
    doctor: 'Dr. Billygraham Deepati',
    degree: 'Anaesthesia',
    areas: ['Adult anaesthesia', 'Regional and nerve block anaesthesia'],
    href: '#doctor-billygraham',
    symbol: <AnaesthesiaSymbol />,
  },
];

const ROTATE_MS = 5000;

// Shows one speciality at a time; it advances on its own, pauses while the visitor is on it, and never moves for reduced motion.
function SpecialityShowcase({ isOpen }: { isOpen: boolean }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % specialities.length), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused]);

  const onTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + specialities.length) % specialities.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <aside
      className="vh-dial-card vh-spec-card"
      aria-label="Our specialities"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false); }}
    >
      <div className="vh-spec-top">
        <span className={`vh-spec-status${isOpen ? '' : ' is-closed'}`} data-testid="status-open">
          <span aria-hidden="true" />{isOpen ? 'Open now' : 'Closed now'} · 7 days
        </span>
        <div className="vh-spec-tabs" role="tablist" aria-label="Choose a speciality">
          {specialities.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              className={`vh-spec-tab${index === active ? ' is-active' : ''}`}
              type="button"
              role="tab"
              id={`vh-spec-tab-${item.id}`}
              aria-selected={index === active}
              aria-controls={`vh-spec-panel-${item.id}`}
              aria-label={item.title}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onTabKey(event, index)}
            >
              <span className="vh-spec-tab-fill" style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }} />
            </button>
          ))}
        </div>
      </div>

      <div className="vh-spec-stage">
        {specialities.map((item, index) => {
          const isActive = index === active;
          return (
            <div
              key={item.id}
              className={`vh-spec-panel${isActive ? ' is-active' : ''}`}
              role="tabpanel"
              id={`vh-spec-panel-${item.id}`}
              aria-labelledby={`vh-spec-tab-${item.id}`}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <div className="vh-spec-emblem">{item.symbol}</div>
              <h2 className="vh-spec-title">{item.title}</h2>
              <p className="vh-spec-doctor">{item.doctor}<span>{item.degree}</span></p>
              <ul className="vh-spec-areas">
                {item.areas.map((area) => <li key={area}>{area}</li>)}
              </ul>
              <a className="vh-spec-link" href={item.href}>Meet the doctor <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" /></a>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function HomeHero({ phone, phoneLabel, directions, isOpenAt }: HomeHeroProps) {
  const now = useNow();
  const isOpen = isOpenAt(now);

  return (
    <section className="vh-hero" id="home" aria-labelledby="hero-title">
      <div className="vh-hero-media" aria-hidden="true">
        <img src="/assets/hero-sri-balaji-building.webp" alt="" width="934" height="1685" fetchPriority="high" />
      </div>
      <div className="vh-hero-shade" aria-hidden="true" />

      <div className="container vh-hero-inner">
        <div className="vh-hero-copy">
          <p className="vh-hero-pill"><span aria-hidden="true" /> Sri Balaji Hospital · Tanuku</p>
          <h1 id="hero-title">
            <span className="vh-line"><span>Sri Balaji</span></span>
            <span className="vh-line vh-line-soft"><span>Hospital</span></span>
          </h1>
          <p className="vh-telugu font-telugu" lang="te" data-testid="text-hospital-name-telugu">శ్రీ బాలాజీ హాస్పిటల్</p>
          <p className="vh-hero-description">General medicine and anaesthesia care in Sajjapuram, Tanuku, open seven days a week.</p>
          <div className="vh-hero-actions">
            <a className="vh-button vh-button-solid" href={`tel:${phone}`} data-testid="button-call-hero"><PhoneCall size={18} strokeWidth={1.8} aria-hidden="true" /> Call now</a>
            <a className="vh-button vh-button-glass" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions"><MapPin size={18} strokeWidth={1.8} aria-hidden="true" /> Get directions</a>
          </div>
        </div>

        <SpecialityShowcase isOpen={isOpen} />
      </div>

      <div className="vh-rail" aria-label="Key facts about Sri Balaji Hospital">
        <div className="container vh-rail-inner">
          <a className="vh-rail-item vh-rail-emergency" href={`tel:${phone}`} data-testid="button-call-emergency">
            <span className="vh-rail-icon"><Siren size={20} strokeWidth={1.6} aria-hidden="true" /></span>
            <span className="vh-rail-text" data-testid="text-emergency-contact">
              <span className="vh-rail-title">Call for appointments</span>
              <span className="vh-rail-meta">Hospital phone · {phoneLabel}</span>
            </span>
          </a>
          {/* The doctors already rotate in the panel above, so the rail carries where to go and what patients say. */}
          <a className="vh-rail-item" href={directions} target="_blank" rel="noreferrer" aria-label="Find us: Rashtrapati Road, above HDFC Bank. Opens directions in Google Maps">
            <span className="vh-rail-icon"><MapPin size={20} strokeWidth={1.6} aria-hidden="true" /></span>
            <span className="vh-rail-text">
              <span className="vh-rail-title">Find us</span>
              <span className="vh-rail-meta">Above HDFC Bank, Rashtrapati Road</span>
            </span>
            <ArrowUpRight className="vh-rail-arrow" size={18} strokeWidth={1.6} aria-hidden="true" />
          </a>
          <a className="vh-rail-item" href="#reviews">
            <span className="vh-rail-icon"><Star size={20} strokeWidth={1.6} aria-hidden="true" /></span>
            <span className="vh-rail-text">
              <span className="vh-rail-title">3.8 Google rating</span>
              <span className="vh-rail-meta">38 Google reviews</span>
            </span>
            <ArrowUpRight className="vh-rail-arrow" size={18} strokeWidth={1.6} aria-hidden="true" />
          </a>
          <div className="vh-rail-item vh-rail-static">
            <span className="vh-rail-icon"><Stethoscope size={20} strokeWidth={1.6} aria-hidden="true" /></span>
            <span className="vh-rail-text">
              <span className="vh-rail-title">MD (General Medicine)</span>
              <span className="vh-rail-meta">Open 7 days a week</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
