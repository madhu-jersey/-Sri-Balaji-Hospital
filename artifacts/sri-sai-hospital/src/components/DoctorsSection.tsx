import { BadgeCheck, Check, Clock3, PhoneCall, Siren } from 'lucide-react';
import { phone, phoneLabel } from '../data/contact';

// Details from the hospital's brochure (supplied by the owner, Nov 2026).
const doctor = {
  id: 'doctor-billygraham',
  name: 'Dr. D. Billy Graham',
  specialty: 'Critical Care Specialist',
  degree: 'M.B.B.S., M.D.',
  registration: '42113',
  intro: 'Leads emergency, critical care and general medicine at Sri Balaji Hospital, and personally attends serious and critical cases.',
  image: '/assets/dr-billygraham-deepati.webp',
  alt: 'Dr. D. Billy Graham at his consultation desk',
  areas: [
    'Emergency care',
    'Critical care & ICU',
    'General medicine',
    'Snakebite & poisoning',
    'Cardiac care',
    'Diabetes & blood pressure',
  ],
};

// One clean profile card with a single scroll reveal (the earlier version stacked several heavy animations).
export function DoctorsSection() {
  return (
    <section className="section doctors-section" id="doctors" aria-labelledby="doctors-heading">
      <div className="container">
        <div className="section-heading reveal">
          <h2 id="doctors-heading">Meet your <em>doctor</em></h2>
          <p>The doctor who leads care at Sri Balaji Hospital, Tanuku.</p>
        </div>

        <article className="dr-card reveal" id={doctor.id} data-testid="card-doctor-1">
          <figure className="dr-photo">
            <img src={doctor.image} alt={doctor.alt} width={864} height={1080} loading="lazy" decoding="async" data-testid="image-doctor-1" />
            <figcaption className="dr-photo-badge"><span aria-hidden="true" />Attends emergencies 24/7</figcaption>
          </figure>

          <div className="dr-info">
            <p className="dr-specialty" data-testid="text-doctor-specialty-1">{doctor.specialty}</p>
            <h3 className="dr-name" data-testid="text-doctor-name-1">{doctor.name}</h3>
            <p className="dr-degree" data-testid="text-doctor-degree-1">{doctor.degree}</p>
            <p className="dr-intro">{doctor.intro}</p>

            <dl className="dr-facts">
              <div>
                <dt><Clock3 size={17} strokeWidth={1.8} aria-hidden="true" /> Consultation</dt>
                <dd>10 AM – 2 PM<br />6 PM – 8:30 PM</dd>
              </div>
              <div>
                <dt><Siren size={17} strokeWidth={1.8} aria-hidden="true" /> Emergency</dt>
                <dd>24 hours,<br />7 days</dd>
              </div>
              <div>
                <dt><BadgeCheck size={17} strokeWidth={1.8} aria-hidden="true" /> Registration</dt>
                <dd data-testid="text-doctor-registration-1">No. {doctor.registration}</dd>
              </div>
            </dl>

            <p className="dr-areas-title">Areas of care</p>
            <ul className="dr-areas">
              {doctor.areas.map((area, index) => (
                <li key={area} data-testid={`text-doctor-focus-1-${index + 1}`}><Check size={14} strokeWidth={2.4} aria-hidden="true" />{area}</li>
              ))}
            </ul>

            <a className="dr-call" href={`tel:${phone}`} aria-label={`Call Sri Balaji Hospital on ${phoneLabel} to book with ${doctor.name}`} data-testid="button-book-doctor-1">
              <PhoneCall size={18} aria-hidden="true" /> Call {phoneLabel} to book
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
