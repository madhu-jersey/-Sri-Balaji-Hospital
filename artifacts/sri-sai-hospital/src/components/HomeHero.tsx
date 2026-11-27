import { useEffect, useRef, useState } from 'react';
import { MapPin, PhoneCall } from 'lucide-react';
import { PhoneNumbers } from './PhoneNumbers';
import { useLang } from '../i18n';

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
  const { t, lang } = useLang();
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
            <span className="sbh-pill"><span aria-hidden="true" /> {t('24/7 Emergency Hospital in Tanuku')}</span>
            <span className="sbh-h1-sep"> – </span>
            <span className="sbh-wordmark">Sri Balaji</span>{' '}
            <span className="sbh-subtitle">Hospital</span>
          </h1>
          <p className="sbh-telugu font-telugu" lang="te" data-testid="text-hospital-name-telugu">శ్రీ బాలాజీ హాస్పిటల్</p>
          <p className="sbh-lead">{t('Comprehensive medical care, critical care, emergency services and surgical care, led by Dr. D. Billy Graham, M.D.')}</p>
          {/* Owner-confirmed highlights (Nov 2026): established 2006, doctor has 25 years of experience. */}
          <dl className="sbh-stats" data-testid="hero-highlights">
            <div><dt>{t('Running Sri Balaji Hospital since 2006')}</dt><dd>{t('20 years')}</dd></div>
            <div><dt>{t('of experience as a General and Critical Care Specialist')}</dt><dd>{t('25 years')}</dd></div>
          </dl>
          <div className="sbh-actions">
            <a className="sbh-button sbh-button-solid" href={`tel:${phone}`} data-testid="button-call-hero">
              <PhoneCall size={20} strokeWidth={1.8} aria-hidden="true" /> {t('Call now')}
            </a>
            <a className="sbh-button sbh-button-outline" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions">
              <MapPin size={20} strokeWidth={1.8} aria-hidden="true" /> {t('Get directions')}
            </a>
          </div>
          <p className="sbh-note" data-testid="text-emergency-contact">
            {lang === 'te'
              ? <span>అత్యవసర పరిస్థితులు మరియు సందేహాల కోసం 24/7 <PhoneNumbers testId="button-call-emergency" /> కు కాల్ చేయండి.</span>
              : <span>For emergencies and enquiries, call <PhoneNumbers testId="button-call-emergency" />, 24/7.</span>}
          </p>
        </div>

        <div className="sbh-visual" ref={visualRef}>
          <figure className="sbh-photo">
            <img
              src="/assets/hero-sri-balaji-building.webp"
              alt={t('Sri Balaji Hospital building in Sajjapuram, Tanuku, with its Telugu name board')}
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
              <h2 id="sbh-hours-title">{t('Hospital hours')}</h2>
              <span className="sbh-emergency-pill">{t('Emergency 24/7')}</span>
            </div>
            <dl className="sbh-hours-list">
              <div className="sbh-emergency-row"><dt><span aria-hidden="true" />{t('Emergency')}</dt><dd>{t('24 hours, 7 days')}</dd></div>
            </dl>
            <p className="sbh-hours-sub">
              {t('OP timings')}
              {/* Outpatient hours only; emergencies are attended around the clock. */}
              <span className={`sbh-status${isOpen ? '' : ' is-closed'}`} data-testid="status-open">
                <span aria-hidden="true" />{isOpen ? t('OP open now') : t('OP closed now')}
              </span>
            </p>
            <dl className="sbh-hours-list sbh-hours-list-quiet">
              <div><dt>{t('Mon – Sat')}</dt><dd>{t('9:30 AM – 8:30 PM')}</dd></div>
              <div><dt>{t('Sunday')}</dt><dd>{t('10:00 AM – 8:00 PM')}</dd></div>
            </dl>
            {/* Doctor consultation times live in Visit us and the FAQ, keeping this card compact. */}
          </div>
        </div>
      </div>
    </section>
  );
}
