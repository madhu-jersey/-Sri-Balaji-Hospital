import { useEffect } from 'react';
import { Check, PhoneCall } from 'lucide-react';

// Details from the hospital's brochure (supplied by the owner, Nov 2026).
const doctors = [
  {
    id: 'doctor-billygraham',
    name: 'Dr. D. Billy Graham',
    specialty: 'Critical Care Specialist',
    degree: 'M.B.B.S., M.D.',
    registration: 'Registration No. 42113 · Consultation 10 AM – 2 PM, 6 PM – 8:30 PM',
    image: '/assets/dr-billygraham-deepati.webp',
    alt: 'Dr. D. Billy Graham at his consultation desk',
    bookingName: 'Dr. Billy Graham',
    areas: [
      'General medicine and emergency care',
      'Critical care and ICU management',
      'Snakebite and poisoning treatment',
      'Cardiac, diabetes and blood pressure care',
    ],
  },
];

import { phone } from '../data/contact';

function useDoctorPortraitEffects() {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches) return;

    const portraits = Array.from(document.querySelectorAll<HTMLElement>('.doctor-image'));
    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      const portrait = event.currentTarget as HTMLElement;
      const rect = portrait.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      portrait.style.setProperty('--spotlight-x', `${x * 100}%`);
      portrait.style.setProperty('--spotlight-y', `${y * 100}%`);
      const tiltX = (0.5 - y) * 8;
      const tiltY = (x - 0.5) * 8;
      portrait.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    };
    const reset = (event: PointerEvent) => {
      const portrait = event.currentTarget as HTMLElement;
      portrait.style.setProperty('--spotlight-x', '50%');
      portrait.style.setProperty('--spotlight-y', '50%');
      portrait.style.removeProperty('transform');
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) {
        portraits.forEach((portrait) => {
          portrait.style.removeProperty('transform');
          portrait.style.setProperty('--spotlight-x', '50%');
          portrait.style.setProperty('--spotlight-y', '50%');
        });
      }
    };

    portraits.forEach((portrait) => {
      portrait.addEventListener('pointermove', onPointerMove);
      portrait.addEventListener('pointerleave', reset);
    });
    reducedMotion.addEventListener('change', onMotionChange);
    return () => {
      portraits.forEach((portrait) => {
        portrait.removeEventListener('pointermove', onPointerMove);
        portrait.removeEventListener('pointerleave', reset);
      });
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, []);
}

export function DoctorsSection() {
  useDoctorPortraitEffects();

  return (
    <section className="section section-white doctors-section" id="doctors" aria-labelledby="doctors-heading">
      <div className="container">
        <div className="section-heading reveal">
          <span className="eyebrow">Meet your doctors</span>
          <h2 id="doctors-heading">Meet your <em>doctor</em></h2>
          <p>The doctor who sees patients at Sri Balaji Hospital, Tanuku.</p>
        </div>
        <div className="doctor-grid">
          {doctors.map((doctor, doctorIndex) => (
            <article
              className={`doctor-card reveal reveal-delay-${doctorIndex + 1}`}
              id={doctor.id}
              key={doctor.name}
              data-testid={`card-doctor-${doctorIndex + 1}`}
            >
              <div className="doctor-image">
                <img
                  src={doctor.image}
                  alt={doctor.alt}
                  width={864}
                  height={1080}
                  loading="lazy"
                  data-testid={`image-doctor-${doctorIndex + 1}`}
                />
              </div>
              <div className="doctor-info">
                <span className="doctor-specialty doctor-staged" style={{ transitionDelay: '0ms' }} data-testid={`text-doctor-specialty-${doctorIndex + 1}`}>
                  {doctor.specialty}
                </span>
                <h3 className="doctor-name doctor-staged" style={{ transitionDelay: '60ms' }} data-testid={`text-doctor-name-${doctorIndex + 1}`}>
                  {doctor.name}
                </h3>
                <p className="doctor-degree doctor-staged" style={{ transitionDelay: '120ms' }} data-testid={`text-doctor-degree-${doctorIndex + 1}`}>
                  {doctor.degree}
                </p>
                <p className="doctor-reg doctor-staged" style={{ transitionDelay: '180ms' }} data-testid={`text-doctor-registration-${doctorIndex + 1}`}>
                  {doctor.registration}
                </p>
                <hr className="doctor-divider doctor-staged" style={{ transitionDelay: '240ms' }} />
                <p className="doctor-focus-heading doctor-staged" style={{ transitionDelay: '300ms' }}>Areas of care</p>
                <ul className="focus-list">
                  {doctor.areas.map((area, areaIndex) => (
                    <li
                      key={area}
                      className="doctor-focus-item"
                      style={{ transitionDelay: `${360 + areaIndex * 60}ms` }}
                      data-testid={`text-doctor-focus-${doctorIndex + 1}-${areaIndex + 1}`}
                    >
                      <Check size={17} aria-hidden="true" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
                <div className="doctor-actions doctor-staged" style={{ transitionDelay: '600ms' }}>
                  <a
                    className="button button-primary"
                    href={`tel:${phone}`}
                    aria-label={`Call Sri Balaji Hospital to book with ${doctor.bookingName}`}
                    data-testid={`button-book-doctor-${doctorIndex + 1}`}
                  >
                    <PhoneCall size={17} aria-hidden="true" />
                    Book with {doctor.bookingName}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
