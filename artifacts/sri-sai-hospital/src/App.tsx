import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Camera, Clock3, HeartPulse, MapPin, Menu, PhoneCall, Stethoscope, X, ChevronDown, ArrowUpRight,
} from 'lucide-react';
import { DoctorsSection } from './components/DoctorsSection';
import { ServicesSection } from './components/ServicesSection';
import { HomeHero } from './components/HomeHero';
import { FaqSection, InsuranceSection, WhyChooseSection } from './components/InfoPages';
import { galleryItems } from './data/gallery';

const GalleryPage = lazy(() => import('./components/GalleryPage').then((module) => ({ default: module.GalleryPage })));

import { phone, phoneLabel } from './data/contact';
// Use the hospital's Google Maps listing (west side of Coaxial St), not raw coordinates,
// so the destination shows the hospital name and the pin lands on the building.
const directions = 'https://www.google.com/maps/dir//Sri+Balaji+Hospital,+Sajjapuram,+Andhra+Pradesh+534211/@16.7576843,81.6738392,262m/data=!3m1!1e3!4m17!1m7!3m6!1s0x3a37b7eff274126f:0x8c3bfa541f70b6fc!2sSri+Balaji+Hospital!8m2!3d16.7576843!4d81.6738392!16s%2Fg%2F11c5480cck!4m8!1m0!1m5!1m1!1s0x3a37b7eff274126f:0x8c3bfa541f70b6fc!2m2!1d81.6738392!2d16.7576843!3e0!5m1!1e1?entry=ttu';
const reviewsUrl = 'https://www.google.com/maps/search/?api=1&query=Sri+Balaji+Hospital+Sajjapuram+Tanuku+reviews';
// Street View of the hospital front, as supplied by the hospital.
const mapPinUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d81.6738392!3d16.7576843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37b7eff274126f%3A0x8c3bfa541f70b6fc!2sSri%20Balaji%20Hospital!5e0!3m2!1sen!2sin!4v1794850000000!5m2!1sen!2sin';
const streetViewUrl = 'https://www.google.com/maps/embed?pb=!4v1794485477933!6m8!1m7!1ssWC_F3N6P1sG3tlpzx1FNg!2m2!1d16.7576926651265!2d81.67400905864211!3f263.43756!4f0!5f0.7820865974627469';
// No verified YouTube channel or Instagram account supplied: both are removed from the page.

type PageRoute = 'home' | 'gallery';

// FAQ and Why choose us used to be separate pages; their old URLs now open the matching home section.
const legacySectionPaths: Record<string, string> = { '/faq': 'faq', '/why-choose': 'why-choose' };

function getPageRoute(): PageRoute {
  if (window.location.pathname === '/gallery' || window.location.hash === '#gallery-view') return 'gallery';
  return 'home';
}

function isStandaloneRoute() {
  return getPageRoute() !== 'home';
}

// Transcribed from Google Maps review screenshots supplied by the hospital; review dates were not supplied.
const reviews = [
  { quote: 'Sri Balaji Hospital is one of the trust worthy and patient friendly hospital in Tanuku. Doctor garu is very efficient and not money minded. We got so many people from our locality particularly from my family treated in this hospital with very good results. Staff are well trained and services are provided at a very reasonable rate. There are no unnecessary lab tests or medicines prescribed. Dr. Billy Graham is the only doctor in town who attends any serious case without hesitation 24hours a day.', name: 'Raaki Rakesh', age: '' },
  { quote: 'Doctor is friendly and good doctor 😇 Great experience, the doctors were highly experienced and the nursing staff were super supportive. I recommend for my Family members also.... We are great full for your services. Thank you 👍', name: 'Sai Kiran', age: '' },
  { quote: 'Excellent experience the doctor and staff are very competent and the care provided is 24/7', name: 'Harsh Shekhar', age: '' },
];

const reviewRating = 3.8;
const reviewCount = 38;

// Directory-listed hours, in minutes since midnight (Asia/Kolkata).
const openingHours: Record<string, [number, number]> = {
  Mon: [570, 1230], Tue: [570, 1230], Wed: [570, 1230], Thu: [570, 1230], Fri: [570, 1230], Sat: [570, 1230],
  Sun: [600, 1200],
};

function getOpenState(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const day = parts.find((part) => part.type === 'weekday')?.value;
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  const totalMinutes = hour * 60 + minute;
  // Mon–Sat 9:30 AM – 8:30 PM, Sun 10:00 AM – 8:00 PM, as listed in directories.
  const hours = openingHours[day ?? ''];
  return Boolean(hours) && totalMinutes >= hours[0] && totalMinutes < hours[1];
}

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const isStandalonePage = isStandaloneRoute();
  useEffect(() => {
    // Reading scrollY alone never forces a layout, so this stays cheap on every scroll event.
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (isStandaloneRoute()) {
      setActiveSection('');
      return () => window.removeEventListener('scroll', onScroll);
    }
    // The section crossing a thin line just below the header is the current one.
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection((entry.target as HTMLElement).id); });
    }, { rootMargin: '-120px 0px -70% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [isStandalonePage]);
  // While the phone menu is open: lock page scroll and let Escape close it.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add('menu-open');
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);
  const homePrefix = isStandalonePage ? '/' : '';
  const navLink = (section: string) => `${homePrefix}#${section}`;
  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-inner">
        <a className="brand" href={navLink('home')} aria-label="Sri Balaji Hospital home" data-testid="link-brand-home" onClick={closeMenu}>
          <img src="/assets/sri-balaji-hospital-logo.png" alt="Sri Balaji Hospital logo" />
          <span className="brand-name">Sri Balaji Hospital<small>Sajjapuram · Tanuku</small></span>
        </a>
        <nav className={`nav-links${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <a href={navLink('services')} aria-current={activeSection === 'services' ? 'location' : undefined} data-testid="link-nav-services" onClick={closeMenu}>Services</a>
          <a href={navLink('why-choose')} aria-current={activeSection === 'why-choose' ? 'location' : undefined} data-testid="link-nav-why-choose" onClick={closeMenu}>Why choose us</a>
          <a href={navLink('doctors')} aria-current={activeSection === 'doctors' ? 'location' : undefined} data-testid="link-nav-doctors" onClick={closeMenu}>Our doctors</a>
          <a href={navLink('gallery')} aria-current={activeSection === 'gallery' ? 'location' : undefined} data-testid="link-nav-hospital" onClick={closeMenu}>Hospital</a>
          <a href={navLink('reviews')} aria-current={activeSection === 'reviews' ? 'location' : undefined} data-testid="link-nav-reviews" onClick={closeMenu}>Reviews</a>
          <a href={navLink('faq')} aria-current={activeSection === 'faq' ? 'location' : undefined} data-testid="link-nav-faq" onClick={closeMenu}>FAQ</a>
          <a href={navLink('visit')} aria-current={activeSection === 'visit' ? 'location' : undefined} data-testid="link-nav-visit" onClick={closeMenu}>Visit us</a>
          <div className="nav-mobile-actions">
            <a className="nav-mobile-call" href={`tel:${phone}`} onClick={closeMenu}><PhoneIcon /> Call {phoneLabel}</a>
            <a className="nav-mobile-directions" href={directions} target="_blank" rel="noreferrer" onClick={closeMenu}><MapPin size={17} aria-hidden="true" /> Get directions</a>
          </div>
        </nav>
        <div className="header-contact-actions">
          <a className="nav-call" href={`tel:${phone}`} data-testid="button-call-header"><PhoneIcon /> Call now</a>
        </div>
        <button className="nav-toggle" type="button" data-testid="button-toggle-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.7a15 15 0 0 0 4.8 4.8L15 13l5 2v4c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 5c0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ProgressLine() {
  const progressRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let max = 1;
    let scheduled = false;
    const measure = () => { max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    const update = () => {
      scheduled = false;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, window.scrollY / max)})`;
    };
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(() => { measure(); onScroll(); });
    resizeObserver.observe(document.body);
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
  }, []);
  return <div className="top-progress" aria-hidden="true"><span ref={progressRef} /></div>;
}

function useReveal(isGalleryPage: boolean) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .info-page'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    let scoreTimer = 0;
    let scoreFrame = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.matches('.review-summary, .sbr-summary')) {
            const score = entry.target.querySelector<HTMLElement>('.review-score, .sbr-score');
            if (score && score.dataset.countStarted !== 'true') {
              score.dataset.countStarted = 'true';
              score.textContent = '0.0';
              scoreTimer = window.setTimeout(() => {
                const start = performance.now();
                const updateScore = (now: number) => {
                  const progress = Math.min(1, (now - start) / 700);
                  score.textContent = `${(reviewRating * progress).toFixed(1)}`;
                  if (progress < 1) scoreFrame = window.requestAnimationFrame(updateScore);
                };
                scoreFrame = window.requestAnimationFrame(updateScore);
              }, 150);
            }
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '100000px 0px -8% 0px' }); // huge top margin: anything already scrolled past (e.g. by a fast fling) also counts as seen
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      window.clearTimeout(scoreTimer);
      window.cancelAnimationFrame(scoreFrame);
    };
  }, [isGalleryPage]);
}

function Doctors() {
  return <DoctorsSection />;
}

// Six photos fill two even rows of three (three rows of two on phones).
const HOME_GALLERY_COUNT = 6;
const homeGalleryItems = galleryItems.slice(0, HOME_GALLERY_COUNT);

function Gallery() {
  return (
    <section className="section" id="gallery" aria-labelledby="gallery-heading">
      <div className="container">
        <div className="section-heading gallery-section-heading reveal">
          <span className="eyebrow">A look around</span>
          <h2 id="gallery-heading"><span className="gallery-heading-word"><span>A place for</span></span>{' '}<em><span className="gallery-heading-word"><span>care.</span></span></em></h2>
          <p>Explore the spaces at Sri Balaji Hospital.</p>
        </div>
        {/* Even grid of equal 4:3 tiles; each photo fills its tile (focus point set per photo in data/gallery.ts). */}
        <div className="gallery-grid">
          {homeGalleryItems.map((item, index) => (
            <a className="gallery-card reveal" href="#gallery-view" key={item.id} style={{ '--motion-delay': `${(index % 3) * 70}ms` } as React.CSSProperties} aria-label={`${item.caption}: open the gallery`}>
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" style={{ objectPosition: item.focus ?? '50% 50%' }} data-testid={`image-hospital-${index + 1}`} />
              <span className="gallery-caption">{item.caption}</span>
              {item.sample && <span className="gallery-sample-tag">Sample</span>}
            </a>
          ))}
        </div>
        {galleryItems.some((item) => item.sample) && <p className="gallery-soon">Images marked "Sample" are illustrations; photographs of the hospital will replace them soon.</p>}
        <div className="gallery-view-link-row">
          <a className="gallery-view-link" href="#gallery-view">
            {galleryItems.length > HOME_GALLERY_COUNT ? 'View more photos' : 'View photos'} <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

// `fill` is how much of the star is coloured (0–1); partial stars use a hard-stop gradient.
function ReviewStar({ index, fill = 1, gradientId }: { index: number; fill?: number; gradientId?: string }) {
  const partial = fill < 1 && gradientId;
  return (
    <svg className="review-star" style={{ '--star-index': index } as React.CSSProperties} viewBox="0 0 24 24" aria-hidden="true">
      {partial && (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset={`${fill * 100}%`} stopColor="currentColor" />
            <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      <path
        d="m12 2.8 2.8 5.7 6.3.9-4.55 4.43 1.08 6.27L12 17.14l-5.63 2.96 1.08-6.27L2.9 9.4l6.3-.9L12 2.8Z"
        {...(partial ? { fill: `url(#${gradientId})`, stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' as const } : {})}
      />
    </svg>
  );
}

function Reviews() {
  return (
    <section className="section reviews-section" id="reviews" aria-labelledby="reviews-heading">
      <div className="container">
        <div className="section-heading review-heading reveal">
          <span className="eyebrow">Patient experiences</span>
          <h2 id="reviews-heading">
            <span className="review-word"><span>What</span></span>{' '}
            <span className="review-word"><span>patients</span></span>{' '}
            <em><span className="review-word"><span>say</span></span></em>
          </h2>
          <p>Real experiences shared by patients and their families on Google.</p>
        </div>
        <div className="sbr-layout">
          <aside className="sbr-summary reveal" aria-label="Google rating">
            <div className="sbr-score-row">
              <span className="sbr-score" aria-label={`${reviewRating} out of 5`}>{reviewRating.toFixed(1)}</span>
              <span className="sbr-score-meta">
                <span className="review-stars" aria-label={`${reviewRating} stars`}>
                  {[0, 1, 2, 3, 4].map((star) => (
                    <ReviewStar key={star} index={star} fill={Math.max(0, Math.min(1, reviewRating - star))} gradientId={`review-star-partial-${star}`} />
                  ))}
                </span>
                <span className="sbr-count">{reviewCount} Google reviews</span>
              </span>
            </div>
            <p className="sbr-note">Reviews are shown as patients wrote them on Google.</p>
            <a className="sbr-button" href={reviewsUrl} target="_blank" rel="noreferrer" data-testid="button-more-google-reviews">
              Read more reviews on Google <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </aside>
          <div className="sbr-grid">
            {reviews.map((review, index) => (
              <article className={`sbr-card reveal${index === 0 ? ' sbr-card-wide' : ''}`} key={review.name} data-testid={`card-review-${index + 1}`}>
                {/* Each review was supplied with a 5/5 rating. */}
                <span className="sbr-stars review-stars" aria-label="Rated 5 out of 5">
                  {[0, 1, 2, 3, 4].map((star) => <ReviewStar key={star} index={star} />)}
                </span>
                <blockquote>{review.quote}</blockquote>
                <footer className="sbr-card-foot">
                  <span className="sbr-name">{review.name}</span>
                  <span className="sbr-source">Google review</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Visit() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapView, setMapView] = useState<'map' | 'street'>('map');
  return (
    <section className="section section-white visit-section" id="visit" aria-labelledby="visit-heading">
      <div className="container">
        <div className="section-heading reveal">
          <span className="eyebrow">Visit us</span>
          <h2 id="visit-heading">
            <span className="visit-heading-word"><span>We’re</span></span>{' '}
            <span className="visit-heading-word"><span>here</span></span>{' '}
            <span className="visit-heading-word"><span>when</span></span>{' '}
            <em><span className="visit-heading-word"><span>you need us.</span></span></em>
          </h2>
          <p>Plan your visit or call the hospital for assistance.</p>
        </div>
        <div className="visit-grid">
          <div className="visit-panel">
            <div className="visit-block reveal" style={{ '--visit-index': 0 } as React.CSSProperties}>
              <p className="visit-label">Address</p>
              <p className="visit-value address">Sri Balaji Hospital, Sajjapuram, Andhra Pradesh 534211</p>
            </div>
            <div className="visit-block reveal" style={{ '--visit-index': 1 } as React.CSSProperties}>
              <p className="visit-label">Call</p>
              <div className="visit-actions">
                <a className="button button-primary" href={`tel:${phone}`} data-testid="button-call-visit"><PhoneIcon /> {phoneLabel}</a>
              </div>
            </div>
            <div className="visit-block reveal" style={{ '--visit-index': 2 } as React.CSSProperties}>
              <p className="visit-label">Hospital hours <span className="visit-emergency-pill">Emergency 24/7</span></p>
              <div className="hours-table">
                <div className="hours-row hours-row-emergency"><span>Emergency</span><span>24 hours, 7 days</span></div>
                <div className="hours-row reveal" style={{ '--hours-index': 0 } as React.CSSProperties}><span>OP · Monday–Saturday</span><span>9:30 AM – 8:30 PM</span></div>
                <div className="hours-row reveal" style={{ '--hours-index': 1 } as React.CSSProperties}><span>OP · Sunday</span><span>10:00 AM – 8:00 PM</span></div>
                <div className="hours-row reveal" style={{ '--hours-index': 2 } as React.CSSProperties}><span>Doctor consultation</span><span>10 AM – 2 PM, 6 PM – 8:30 PM</span></div>
              </div>
            </div>
            <div className="visit-block casualty-block reveal" style={{ '--visit-index': 3 } as React.CSSProperties}>
              <p className="visit-label">Accessibility</p>
              <p className="visit-value"><span className="casualty-dot" aria-hidden="true" />Wheelchair-accessible parking &amp; entrance</p>
            </div>
          </div>
          <div
            // className stays constant: the reveal observer adds is-visible to the DOM, and a re-render must not wipe it.
            className="map-frame reveal"
            data-loaded={mapLoaded}
            data-interactive={mapInteractive}
            data-testid="card-hospital-map"
          >
            <div className="map-shimmer" aria-hidden="true" />
            <a className="map-directions" href={directions} target="_blank" rel="noopener noreferrer" aria-label="Go to Sri Balaji Hospital location in Google Maps" data-testid="link-go-to-location">
              <MapPin size={17} strokeWidth={1.8} aria-hidden="true" /> Go to location
            </a>
            <div className="map-view-toggle" role="group" aria-label="Map view">
              <button type="button" aria-pressed={mapView === 'map'} onClick={() => setMapView('map')}>Map</button>
              <button type="button" aria-pressed={mapView === 'street'} onClick={() => { setMapView('street'); setMapInteractive(true); }}>Street view</button>
            </div>
            <iframe
              key={mapView}
              title={mapView === 'map' ? 'Map: Sri Balaji Hospital, Sajjapuram, Andhra Pradesh 534211' : 'Street View of Sri Balaji Hospital'}
              data-testid="frame-hospital-map"
              src={mapView === 'map' ? mapPinUrl : streetViewUrl}
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={() => setMapLoaded(true)}
            />
            {!mapInteractive && (
              <button
                className="map-interaction-enable"
                type="button"
                aria-label="Enable map interaction"
                onClick={() => setMapInteractive(true)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const homePrefix = isStandaloneRoute() ? '/' : '';
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand reveal" style={{ '--footer-index': 0 } as React.CSSProperties}>
            <img src="/assets/sri-balaji-hospital-logo.png" alt="Sri Balaji Hospital logo" />
            <h2>Sri Balaji Hospital</h2>
            <p className="font-telugu" lang="te">శ్రీ బాలాజీ హాస్పిటల్</p>
            <p className="footer-location">Sajjapuram, Andhra Pradesh 534211</p>
          </div>
          <div className="footer-explore-column reveal" style={{ '--footer-index': 1 } as React.CSSProperties}>
            <p className="footer-label">Explore</p>
            <nav className="footer-nav" aria-label="Footer navigation">
              <a href={`${homePrefix}#services`} data-testid="link-footer-services">Services</a><a href={`${homePrefix}#why-choose`} data-testid="link-footer-why-choose">Why choose us</a>
              <a href={`${homePrefix}#doctors`} data-testid="link-footer-doctors">Our doctors</a><a href={`${homePrefix}#gallery`} data-testid="link-footer-hospital">Hospital</a>
              <a href={`${homePrefix}#reviews`} data-testid="link-footer-reviews">Reviews</a><a href={`${homePrefix}#faq`} data-testid="link-footer-faq">FAQ</a>
              <a href={`${homePrefix}#visit`} data-testid="link-footer-visit">Visit us</a>
            </nav>
          </div>
          <div className="footer-connect-column reveal" style={{ '--footer-index': 2 } as React.CSSProperties}>
            <p className="footer-label">Connect</p>
            <div className="footer-social">
              <a href={`tel:${phone}`} data-testid="link-footer-call"><PhoneCall size={18} strokeWidth={1.6} aria-hidden="true" />Call {phoneLabel}</a>
              <a href={reviewsUrl} target="_blank" rel="noreferrer" data-testid="link-footer-google"><MapPin size={18} strokeWidth={1.6} aria-hidden="true" />Google Maps reviews</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Information only. This website does not replace a consultation or emergency care.</p>
          <p>© Sri Balaji Hospital · Tanuku</p>
        </div>
      </div>
    </footer>
  );
}

// The floating Call / Directions bar stays hidden while the hero's own buttons are on screen,
// and slides up once the visitor scrolls past them.
function MobileActions() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const heroActions = document.querySelector('.sbh-actions');
    if (!heroActions) {
      setVisible(true);
      return;
    }
    // Visible when the hero buttons are off screen above (scrolled past), hidden while they are on screen.
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    }, { threshold: 0 });
    observer.observe(heroActions);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`mobile-actions${visible ? ' is-visible' : ''}`} aria-label="Quick contact" aria-hidden={!visible} inert={!visible}>
      <a className="call" href={`tel:${phone}`} data-testid="button-call-mobile"><PhoneIcon /> Call</a>
      <a className="directions" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions-mobile"><MapPin size={17} aria-hidden="true" /> Directions</a>
    </div>
  );
}

function App() {
  const [pageRoute, setPageRoute] = useState<PageRoute>(getPageRoute);
  const isGalleryPage = pageRoute === 'gallery';
  useReveal(isGalleryPage);
  useEffect(() => {
    const legacySection = legacySectionPaths[window.location.pathname];
    if (legacySection) window.history.replaceState(null, '', `/#${legacySection}`);
    const updateRoute = () => setPageRoute(getPageRoute());
    window.addEventListener('hashchange', updateRoute);
    window.addEventListener('popstate', updateRoute);
    updateRoute();
    return () => {
      window.removeEventListener('hashchange', updateRoute);
      window.removeEventListener('popstate', updateRoute);
    };
  }, []);
  useEffect(() => {
    // Sections render after load, so the browser cannot scroll to a hash target on its own.
    if (pageRoute !== 'home' || window.location.hash.length < 2) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      target?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pageRoute]);
  useEffect(() => {
    const pageMetadata = {
      home: {
        title: 'Sri Balaji Hospital Tanuku | 24/7 Emergency Hospital in Tanuku',
        description: 'Sri Balaji Hospital, Sajjapuram, Tanuku – 24/7 emergency hospital with ICU, ventilator and critical care, general medicine and surgery. Dr. D. Billy Graham, M.D. Call 08819 221778.',
      },
      gallery: {
        title: 'Gallery · Sri Balaji Hospital Tanuku',
        description: 'Photographs of Sri Balaji Hospital, Sajjapuram, Andhra Pradesh 534211.',
      },
    } satisfies Record<PageRoute, { title: string; description: string }>;
    document.title = pageMetadata[pageRoute].title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = pageMetadata[pageRoute].description;
  }, [pageRoute]);
  useEffect(() => {
    if (!isGalleryPage) return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    return () => window.cancelAnimationFrame(frame);
  }, [isGalleryPage]);
  return (
    <>
      <ProgressLine />
      <SiteHeader />
      {isGalleryPage ? (
        <Suspense fallback={<main className="gallery-page" aria-busy="true" />}>
          <GalleryPage />
        </Suspense>
      ) : (
        <main>
          <HomeHero phone={phone} phoneLabel={phoneLabel} directions={directions} isOpenAt={getOpenState} />
          <ServicesSection />
          <WhyChooseSection />
          <Doctors />
          <Gallery />
          <Reviews />
          <InsuranceSection />
          {/* Insurance and cashless confirmed by the owner (Nov 2026); Aarogyasri is still not confirmed, so it is not mentioned. */}
          <Visit />
          <FaqSection />
        </main>
      )}
      <Footer />
      {!isGalleryPage && <MobileActions />}
    </>
  );
}

export default App;
