import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, MapPin, PhoneCall, Star } from 'lucide-react';

type Contact = { phone: string; phoneLabel: string; directions: string; reviewsUrl: string };

/* ---------- Live timings (Asia/Kolkata); same facts as the Visit section ---------- */
type Span = { from: number; to: number };
type DayPlan = { hospital: Span; doctor: Span[] };
const MON_SAT: DayPlan = { hospital: { from: 570, to: 1230 }, doctor: [{ from: 600, to: 840 }, { from: 1080, to: 1260 }] };
const SUNDAY: DayPlan = { hospital: { from: 600, to: 1200 }, doctor: [] };

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
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`;
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function today(date: Date) {
  const { weekday, minutes } = kolkataNow(date);
  const plan = weekday === 'Sunday' ? SUNDAY : MON_SAT;
  const tomorrow = weekday === 'Saturday' ? SUNDAY : MON_SAT;
  const open = minutes >= plan.hospital.from && minutes < plan.hospital.to;
  const doctorNow = plan.doctor.find((w) => minutes >= w.from && minutes < w.to);
  const doctorNext = plan.doctor.find((w) => minutes < w.from);
  let status: string;
  if (doctorNow) status = `Doctor consulting now, until ${clock(doctorNow.to)}`;
  else if (open && doctorNext) status = `Open now · doctor from ${clock(doctorNext.from)}`;
  else if (open) status = `Open now · until ${clock(plan.hospital.to)}`;
  else if (minutes < plan.hospital.from) status = `Opens today at ${clock(plan.hospital.from)}`;
  else status = `Closed · opens tomorrow at ${clock(tomorrow.hospital.from)}`;
  return {
    weekday,
    live: open || Boolean(doctorNow),
    status,
    hospital: `${clock(plan.hospital.from)} – ${clock(plan.hospital.to)}`,
    doctor: plan.doctor.length ? plan.doctor.map((w) => `${clock(w.from)} – ${clock(w.to)}`).join(' & ') : 'Not listed today',
  };
}

/* ---------- Hero ---------- */
export function LuxuryHero({ phone, phoneLabel, directions }: Contact) {
  const t = today(useNow());
  return (
    <section className="lx-hero" id="home" aria-labelledby="hero-title">
      <div className="container lx-hero-grid">
        <div className="lx-hero-copy">
          <h1 id="hero-title">
            <span className="lx-line"><span>Sri Balaji</span></span>
            <span className="lx-line"><span>Hospital</span></span>
          </h1>
          <p className="lx-hero-telugu font-telugu" lang="te" data-testid="text-hospital-name-telugu">శ్రీ బాలాజీ హాస్పిటల్</p>
          <span className="lx-rule" aria-hidden="true" />
          <p className="lx-hero-lede">Unhurried, doctor-led care in general medicine and anaesthesia, from Dr. Billygraham Deepati, MD. Open every day of the week.</p>
          <div className="lx-actions">
            <a className="lx-btn lx-btn-solid" href={`tel:${phone}`} data-testid="button-call-hero">
              <PhoneCall size={18} strokeWidth={1.8} aria-hidden="true" /> Call {phoneLabel}
            </a>
            <a className="lx-btn lx-btn-line" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions">
              <MapPin size={18} strokeWidth={1.8} aria-hidden="true" /> Directions
            </a>
          </div>
        </div>

        <figure className="lx-arch lx-hero-arch">
          <span className="lx-arch-window">
          <img
            src="/assets/hero-sri-balaji-building.webp"
            alt="Sri Balaji Hospital building with its rooftop Telugu name board"
            width="934"
            height="1685"
            fetchPriority="high"
          />
          </span>
          <figcaption>
            <span className="lx-stars" aria-hidden="true">{[0, 1, 2, 3].map((i) => <Star key={i} size={12} strokeWidth={0} fill="currentColor" />)}</span>
            3.8 on Google · 38 reviews
          </figcaption>
        </figure>
      </div>

      <div className="container">
        <dl className="lx-today" aria-label="Today's timings">
          <div className="lx-today-status">
            <dt>{t.weekday}</dt>
            <dd data-testid="status-open"><span className={`lx-dot${t.live ? ' is-live' : ''}`} aria-hidden="true" />{t.status}</dd>
          </div>
          <div><dt>Hospital</dt><dd>{t.hospital}</dd></div>
          <div><dt>Doctor</dt><dd>{t.doctor}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/* ---------- Doctor ---------- */
export function LuxuryDoctor({ phone }: Pick<Contact, 'phone'>) {
  return (
    <section className="lx-section lx-doctor" id="doctors" aria-labelledby="doctors-heading">
      <div className="container lx-doctor-grid">
        <figure className="lx-arch lx-doctor-arch" id="doctor-billygraham">
          <img src="/assets/dr-billygraham-deepati.webp" alt="Dr. Billygraham Deepati at his consultation desk" width="864" height="1080" loading="lazy" />
        </figure>
        <div className="lx-doctor-copy">
          <h2 id="doctors-heading">Dr. Billygraham Deepati</h2>
          <p className="lx-doctor-cred">MD (General Medicine) · Anaesthesia</p>
          <blockquote className="lx-quote">
            <p>“Doctor garu is very efficient and not money minded. There are no unnecessary lab tests or medicines prescribed.”</p>
            <footer>Raaki Rakesh, on Google</footer>
          </blockquote>
          <dl className="lx-facts">
            <div><dt>Consultation</dt><dd>Mon–Sat · 10 AM – 2 PM, 6 PM – 9 PM</dd></div>
            <div><dt>Listed fee</dt><dd>₹300</dd></div>
          </dl>
          <a className="lx-btn lx-btn-solid" href={`tel:${phone}`} data-testid="button-book-doctor-1">
            <PhoneCall size={18} strokeWidth={1.8} aria-hidden="true" /> Book a consultation
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */
const services = [
  { title: 'General Medicine', text: 'Consultation, diagnosis and treatment for everyday and long-term conditions.' },
  { title: 'Anaesthesiology', text: 'Adult anaesthesia, planned and monitored by a doctor trained in anaesthesia.' },
  { title: 'Regional & Nerve Block', text: 'Regional anaesthesia and nerve block techniques for targeted pain control.' },
  { title: 'Viral Fever', text: 'Assessment and treatment of viral fevers and related symptoms.' },
  { title: 'Chest Pain', text: 'Prompt medical evaluation and treatment for chest pain.' },
  { title: 'Abdominal Pain', text: 'Medical evaluation and treatment for abdominal pain.' },
];

export function LuxuryServices({ phone }: Pick<Contact, 'phone'>) {
  return (
    <section className="lx-section lx-services" id="services" aria-labelledby="services-heading">
      <div className="container">
        <div className="lx-head">
          <h2 id="services-heading">Care we offer</h2>
          <p>As listed for the hospital. For anything not shown here, a short call will tell you.</p>
        </div>
        <ul className="lx-service-list">
          {services.map((service) => (
            <li key={service.title} data-testid="card-service">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </li>
          ))}
        </ul>
        <a className="lx-link" href={`tel:${phone}`}>Ask the hospital <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </section>
  );
}

/* ---------- Reviews ---------- */
export function LuxuryReviews({ reviewsUrl }: Pick<Contact, 'reviewsUrl'>) {
  return (
    <section className="lx-section lx-reviews" id="reviews" aria-labelledby="reviews-heading">
      <div className="container lx-reviews-inner">
        <h2 id="reviews-heading" className="lx-reviews-title">In patients’ words</h2>
        <figure className="lx-review-lead">
          <blockquote>
            <p>“Sri Balaji Hospital is one of the trust worthy and patient friendly hospital in Tanuku. Staff are well trained and services are provided at a very reasonable rate.”</p>
          </blockquote>
          <figcaption>Raaki Rakesh · five stars on Google</figcaption>
        </figure>
        <div className="lx-review-pair">
          <figure>
            <blockquote><p>“Great experience, the doctors were highly experienced and the nursing staff were super supportive.”</p></blockquote>
            <figcaption>Sai Kiran</figcaption>
          </figure>
          <figure>
            <blockquote><p>“Excellent experience the doctor and staff are very competent.”</p></blockquote>
            <figcaption>Harsh Shekhar</figcaption>
          </figure>
        </div>
        <p className="lx-review-score">
          <span>3.8</span> out of 5 from 38 Google reviews ·{' '}
          <a href={reviewsUrl} target="_blank" rel="noreferrer" data-testid="button-more-google-reviews">Read them all <ArrowUpRight size={15} aria-hidden="true" /></a>
        </p>
      </div>
    </section>
  );
}
