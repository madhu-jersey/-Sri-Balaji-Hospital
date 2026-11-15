import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, MapPin, PhoneCall, Star } from 'lucide-react';

type Contact = { phone: string; phoneLabel: string; directions: string; reviewsUrl: string };

/* ---------- Live timings (Asia/Kolkata), same facts as the Visit section ---------- */
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

function liveStatus(date: Date) {
  const { weekday, minutes } = kolkataNow(date);
  const plan = weekday === 'Sunday' ? SUNDAY : MON_SAT;
  const tomorrow = weekday === 'Saturday' ? SUNDAY : MON_SAT;
  const open = minutes >= plan.hospital.from && minutes < plan.hospital.to;
  const doctorNow = plan.doctor.find((w) => minutes >= w.from && minutes < w.to);
  const doctorNext = plan.doctor.find((w) => minutes < w.from);
  let text: string;
  if (doctorNow) text = `Doctor consulting now, until ${clock(doctorNow.to)}`;
  else if (open && doctorNext) text = `Open now · doctor consults from ${clock(doctorNext.from)}`;
  else if (open) text = `Open now · closes at ${clock(plan.hospital.to)}`;
  else if (minutes < plan.hospital.from) text = `Closed now · opens today at ${clock(plan.hospital.from)}`;
  else text = `Closed now · opens tomorrow at ${clock(tomorrow.hospital.from)}`;
  return {
    open: open || Boolean(doctorNow),
    text,
    weekday,
    hospital: `${clock(plan.hospital.from)} – ${clock(plan.hospital.to)}`,
    doctor: plan.doctor.length ? plan.doctor.map((w) => `${clock(w.from)} – ${clock(w.to)}`).join(' · ') : 'Not listed on Sunday',
  };
}

/* ---------- Hero ---------- */
export function HomeHero({ phone, phoneLabel, directions }: Contact) {
  const status = liveStatus(useNow());
  return (
    <>
      <section className="pm-hero" id="home" aria-labelledby="hero-title">
        <div className="pm-hero-panel">
          <div className="pm-hero-copy">
            <p className="pm-hero-telugu font-telugu" lang="te" data-testid="text-hospital-name-telugu">శ్రీ బాలాజీ హాస్పిటల్</p>
            <h1 id="hero-title">Sri Balaji<br />Hospital</h1>
            <p className="pm-hero-lede">Doctor-led general medicine and anaesthesia care in Sajjapuram, Andhra Pradesh.</p>
            <div className="pm-hero-actions">
              <a className="pm-btn pm-btn-light" href={`tel:${phone}`} data-testid="button-call-hero">
                <PhoneCall size={19} strokeWidth={2} aria-hidden="true" /> Call {phoneLabel}
              </a>
              <a className="pm-btn pm-btn-ghost" href={directions} target="_blank" rel="noreferrer" data-testid="button-directions">
                <MapPin size={19} strokeWidth={2} aria-hidden="true" /> Get directions
              </a>
            </div>
            <dl className="pm-hero-facts">
              <div><dt>Lead doctor</dt><dd>MD, General Medicine</dd></div>
              <div><dt>Open</dt><dd>7 days a week</dd></div>
              <div><dt>Google</dt><dd><Star size={14} strokeWidth={0} fill="currentColor" aria-hidden="true" /> 3.8 · 38 reviews</dd></div>
            </dl>
          </div>
        </div>
        <figure className="pm-hero-photo">
          <img
            src="/assets/hero-sri-balaji-building.webp"
            alt="Sri Balaji Hospital building with its rooftop Telugu name board"
            width="934"
            height="1685"
            fetchPriority="high"
          />
        </figure>
      </section>

      <div className="pm-status" aria-label="Today's timings">
        <div className="container pm-status-inner">
          <p className={`pm-status-live${status.open ? ' is-open' : ''}`} aria-live="polite" data-testid="status-open">
            <span className="pm-status-dot" aria-hidden="true" />{status.text}
          </p>
          <dl className="pm-status-times">
            <div><dt>{status.weekday} · Hospital</dt><dd>{status.hospital}</dd></div>
            <div><dt>Doctor</dt><dd>{status.doctor}</dd></div>
          </dl>
        </div>
      </div>
    </>
  );
}

/* ---------- Doctor ---------- */
export function HomeDoctor({ phone }: Pick<Contact, 'phone'>) {
  return (
    <section className="pm-doctor" id="doctors" aria-labelledby="doctors-heading">
      <div className="container pm-doctor-grid">
        <figure className="pm-doctor-photo" id="doctor-billygraham">
          <img src="/assets/dr-billygraham-deepati.webp" alt="Dr. Billygraham Deepati at his consultation desk" width="864" height="1080" loading="lazy" />
        </figure>
        <div className="pm-doctor-copy">
          <h2 id="doctors-heading">Dr. Billygraham Deepati</h2>
          <p className="pm-doctor-cred">MD (General Medicine) · Anaesthesia</p>
          <blockquote className="pm-doctor-quote">
            <p>“Doctor garu is very efficient and not money minded… There are no unnecessary lab tests or medicines prescribed.”</p>
            <footer>Raaki Rakesh, Google review</footer>
          </blockquote>
          <dl className="pm-doctor-facts">
            <div><dt>Consultation</dt><dd>Mon–Sat, 10 AM – 2 PM and 6 PM – 9 PM</dd></div>
            <div><dt>Listed fee</dt><dd>₹300</dd></div>
            <div><dt>Sees patients for</dt><dd>General medicine, viral fever, chest and abdominal pain, adult and regional anaesthesia</dd></div>
          </dl>
          <a className="pm-btn pm-btn-dark" href={`tel:${phone}`} data-testid="button-book-doctor-1">
            <PhoneCall size={19} strokeWidth={2} aria-hidden="true" /> Book a consultation
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */
const services = [
  { title: 'General Medicine', text: 'Consultation, diagnosis and treatment for everyday and long-term medical conditions.' },
  { title: 'Anaesthesiology', text: 'Adult anaesthesia, planned and monitored by a doctor trained in anaesthesia.' },
  { title: 'Regional & Nerve Block', text: 'Regional anaesthesia and nerve block techniques for targeted pain control.' },
  { title: 'Viral Fever', text: 'Assessment and treatment of viral fevers and related symptoms.' },
  { title: 'Chest & Abdominal Pain', text: 'Medical evaluation and treatment for chest pain and abdominal pain.' },
];

export function HomeServices({ phone }: Pick<Contact, 'phone'>) {
  return (
    <section className="pm-services" id="services" aria-labelledby="services-heading">
      <div className="container">
        <div className="pm-section-head">
          <h2 id="services-heading">What we treat</h2>
          <p>Services listed for the hospital. For anything not shown here, call before you visit.</p>
        </div>
        <ul className="pm-service-list">
          {services.map((service) => (
            <li key={service.title} data-testid="card-service">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </li>
          ))}
        </ul>
        <a className="pm-text-link" href={`tel:${phone}`}>Not sure where to start? Call the hospital <ArrowRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}

/* ---------- Reviews ---------- */
export function HomeReviews({ reviewsUrl }: Pick<Contact, 'reviewsUrl'>) {
  return (
    <section className="pm-reviews" id="reviews" aria-labelledby="reviews-heading">
      <div className="container">
        <h2 id="reviews-heading" className="pm-visually-hidden">What patients say</h2>
        <figure className="pm-review-lead">
          <blockquote>
            <p>“Sri Balaji Hospital is one of the trust worthy and patient friendly hospital in Tanuku… Dr. Billy Graham is the only doctor in town who attends any serious case without hesitation 24hours a day.”</p>
          </blockquote>
          <figcaption>Raaki Rakesh · Google review · 5 stars</figcaption>
        </figure>
        <div className="pm-review-row">
          <figure>
            <blockquote><p>“Doctor is friendly and good doctor. Great experience, the doctors were highly experienced and the nursing staff were super supportive.”</p></blockquote>
            <figcaption>Sai Kiran · 5 stars</figcaption>
          </figure>
          <figure>
            <blockquote><p>“Excellent experience the doctor and staff are very competent and the care provided is 24/7.”</p></blockquote>
            <figcaption>Harsh Shekhar · 5 stars</figcaption>
          </figure>
          <div className="pm-review-score">
            <p className="pm-review-number">3.8<span>/ 5</span></p>
            <p>Google rating from 38 reviews. Reviews are quoted as patients wrote them.</p>
            <a className="pm-text-link pm-text-link-light" href={reviewsUrl} target="_blank" rel="noreferrer" data-testid="button-more-google-reviews">
              Read all reviews <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
