import { useEffect, useRef, useState } from 'react';
import { MapPin, PhoneCall, Star } from 'lucide-react';

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

// Feeds --mx / --my (-1…1) to the photo area so the badge and hours card shift slightly with the mouse.
function usePointerDrift() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!element || !finePointer.matches || reducedMotion.matches) return;
    let frame = 0;
    let pointer = { x: 0, y: 0 };
    const apply = () => {
      frame = 0;
      element.style.setProperty('--mx', pointer.x.toFixed(3));
      element.style.setProperty('--my', pointer.y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      pointer = {
        x: Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1)),
        y: Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1)),
      };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const onLeave = () => {
      pointer = { x: 0, y: 0 };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

export function HomeHero({ phone, phoneLabel, directions, isOpenAt }: HomeHeroProps) {
  const isOpen = isOpenAt(useNow());
  const visualRef = usePointerDrift();
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => hero.classList.toggle('is-offscreen', !entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sbh-hero" id="home" aria-labelledby="hero-title" ref={heroRef}>
      <div className="container sbh-inner">
        <div className="sbh-copy">
          {/* One heading for search engines: "24/7 Emergency Hospital in Tanuku – Sri Balaji Hospital" (looks unchanged). */}
          <h1 id="hero-title">
            <span className="sbh-pill"><span aria-hidden="true" /> 24/7 Emergency Hospital in Tanuku</span>
            <span className="sbh-h1-sep"> – </span>
            <span className="sbh-wordmark">Sri Balaji</span>{' '}
            <span className="sbh-subtitle">Hospital</span>
          </h1>
          <p className="sbh-telugu font-telugu" lang="te" data-testid="text-hospital-name-telugu">శ్రీ బాలాజీ హాస్పిటల్</p>
          <p className="sbh-lead">Comprehensive medical care, critical care, emergency services and surgical care, led by Dr. D. Billy Graham, M.D.</p>
          <div className="sbh-actions">
            <a className="sbh-button sbh-button-solid" href={`tel:${phone}`} data-testid="button-call-hero">
              <PhoneCall size={20} strokeWidth={1.8} aria-hidden="true" /> Call now
            </a>
            <a className="sbh-button sbh-button-outline" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions">
              <MapPin size={20} strokeWidth={1.8} aria-hidden="true" /> Get directions
            </a>
          </div>
          <p className="sbh-note" data-testid="text-emergency-contact">
            <span>For emergencies, call <a href={`tel:${phone}`} data-testid="button-call-emergency">{phoneLabel}</a>, 24 hours a day.</span>
            <span className="sbh-note-sep" aria-hidden="true">·</span>
            <a className="sbh-rating" href="#reviews"><Star size={15} strokeWidth={0} fill="currentColor" aria-hidden="true" /> 3.8 on Google, 38 reviews</a>
          </p>
        </div>

        <div className="sbh-visual" ref={visualRef}>
          <figure className="sbh-photo">
            <img
              src="/assets/hero-sri-balaji-building.webp"
              alt="Sri Balaji Hospital building in Sajjapuram, Tanuku, with its Telugu name board"
              width="934"
              height="1685"
              fetchPriority="high"
            />
          </figure>
          <span className="sbh-badge">
            <img src="/icon-192.png" alt="" width="192" height="192" />
          </span>

          <div className="sbh-hours" aria-labelledby="sbh-hours-title">
            <div className="sbh-hours-head">
              <h2 id="sbh-hours-title">Hospital hours</h2>
              <span className="sbh-emergency-pill">Emergency 24/7</span>
            </div>
            <dl className="sbh-hours-list">
              <div className="sbh-emergency-row"><dt><span aria-hidden="true" />Emergency</dt><dd>24 hours, 7 days</dd></div>
            </dl>
            <p className="sbh-hours-sub">
              OP timings
              {/* Outpatient hours only; emergencies are attended around the clock. */}
              <span className={`sbh-status${isOpen ? '' : ' is-closed'}`} data-testid="status-open">
                <span aria-hidden="true" />{isOpen ? 'OP open now' : 'OP closed now'}
              </span>
            </p>
            <dl className="sbh-hours-list sbh-hours-list-quiet">
              <div><dt>Mon – Sat</dt><dd>9:30 AM – 8:30 PM</dd></div>
              <div><dt>Sunday</dt><dd>10:00 AM – 8:00 PM</dd></div>
            </dl>
            {/* Doctor consultation times live in Visit us and the FAQ, keeping this card compact. */}
          </div>
        </div>
      </div>
    </section>
  );
}
