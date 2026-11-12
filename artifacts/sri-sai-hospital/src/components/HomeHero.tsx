import { useEffect, useState } from 'react';
import { ArrowUpRight, MapPin, PhoneCall, Siren, Star, Stethoscope } from 'lucide-react';

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

// The building photo, cropped to its top so the rooftop Telugu name board is always in view.
function BuildingCard({ isOpen }: { isOpen: boolean }) {
  return (
    <figure className="vh-building-card">
      <img
        src="/assets/hero-sri-balaji-building.webp"
        alt="Sri Balaji Hospital building with its rooftop name board"
        width="934"
        height="1685"
        fetchPriority="high"
      />
      <span className={`vh-spec-status vh-building-status${isOpen ? '' : ' is-closed'}`} data-testid="status-open">
        <span aria-hidden="true" />{isOpen ? 'Open now' : 'Closed now'} · 7 days
      </span>
      <figcaption className="vh-building-caption">
        <strong>Sajjapuram</strong>
        <span>Andhra Pradesh 534211</span>
      </figcaption>
    </figure>
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

        <BuildingCard isOpen={isOpen} />
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
          <a className="vh-rail-item" href={directions} target="_blank" rel="noreferrer" aria-label="Find us: Sajjapuram, Andhra Pradesh 534211. Opens directions in Google Maps">
            <span className="vh-rail-icon"><MapPin size={20} strokeWidth={1.6} aria-hidden="true" /></span>
            <span className="vh-rail-text">
              <span className="vh-rail-title">Find us</span>
              <span className="vh-rail-meta">Sajjapuram, Andhra Pradesh 534211</span>
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
