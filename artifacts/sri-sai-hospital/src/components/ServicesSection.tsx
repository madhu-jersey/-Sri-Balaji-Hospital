import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Activity, Bandage, Brain, BrainCircuit, Building2, Check, ChevronDown, Microscope, PhoneCall, Scissors, Stethoscope, type LucideIcon } from 'lucide-react';

// Departments, sub-services and equipment as listed in the hospital's own brochure (supplied by the owner, Nov 2026).
// Order and lists follow the owner's later changes: Neurology after Neurosurgery, and a separate General Facilities section.
// Each service appears once per section.
const departments: { title: string; short: string; text: string; icon: LucideIcon; items: string[]; unit?: string }[] = [
  {
    title: 'General Medicine & Emergency Care',
    short: 'General Medicine',
    text: 'Diagnosis and treatment for common illnesses, general medical conditions and medical emergencies.',
    icon: Stethoscope,
    items: [
      'General medicine',
      'Fever, viral fever, cold & cough treatment',
      'Poisoning treatment',
      'Snakebite management',
      'Accidents & emergency care',
      'Burns treatment',
      'Cardiac care',
      'Diabetes management',
      'Diabetic foot care',
      'High blood pressure management',
      'Asthma & respiratory care',
    ],
  },
  {
    title: 'General Surgery',
    short: 'General Surgery',
    text: 'Diagnosis and surgical management of common surgical conditions.',
    icon: Scissors,
    items: [
      'Appendix surgery (appendectomy)',
      'Hernia surgery',
      'Gallbladder surgery',
      'Thyroid surgery',
      'Piles (hemorrhoids) surgery',
      'Anal fissure treatment',
      'Fistula treatment',
      'Abscess & cyst removal',
      'Lipoma removal',
      'Hydrocele surgery',
      'Breast lump surgery',
      'Hysterectomy',
      'Vaginal hysterectomy',
      'Ovarian tumours / cysts',
      'Fibroid treatment',
      'Diabetic foot ulcer treatment / amputation',
      'Skin grafting',
      'Wound management',
      'Minor surgical procedures',
    ],
  },
  {
    title: 'Neurosurgery',
    short: 'Neurosurgery',
    text: 'Surgical care for conditions of the brain, spine and nervous system.',
    icon: Brain,
    items: [
      'Brain tumour surgery',
      'Head injury management',
      'Brain hemorrhage surgery',
      'Spine surgery',
      'Slip disc treatment',
      'Spinal cord injury management',
      'Sciatica treatment',
      'Nerve compression surgery',
      'Hydrocephalus treatment',
      'Stroke-related neurosurgical care',
    ],
  },
  {
    title: 'Neurology',
    short: 'Neurology',
    text: 'Diagnosis and medical treatment of conditions affecting the brain and nerves.',
    icon: BrainCircuit,
    items: [
      'Stroke and paralysis',
      'Seizures (fits)',
      'Meningitis',
      'Headache and migraine',
      'Memory loss',
      "Parkinson's disease (shaking disorders)",
    ],
  },
  {
    title: 'Plastic & Reconstructive Surgery',
    short: 'Plastic Surgery',
    text: 'Procedures to restore, improve or reconstruct damaged tissue and body structures.',
    icon: Bandage,
    items: [
      'Burn treatment & reconstruction',
      'Skin grafting',
      'Scar revision surgery',
      'Wound reconstruction',
      'Facial injury reconstruction',
      'Cleft lip & palate surgery',
      'Cosmetic surgery',
      'Hand reconstruction surgery',
      'Congenital deformity correction',
      'Soft tissue reconstruction',
    ],
  },
  {
    title: 'Laparoscopic Surgery',
    short: 'Laparoscopy',
    text: 'Minimally invasive surgery through small incisions with specialised instruments.',
    icon: Microscope,
    items: [
      'Laparoscopic appendix surgery',
      'Laparoscopic gallbladder surgery (Lap Chole)',
      'Laparoscopic hernia surgery',
      'Total laparoscopic hysterectomy',
      'Diagnostic laparoscopy',
      'Laparoscopic ovarian cyst surgery',
      'Laparoscopic intestinal surgery',
      'Minimally invasive abdominal surgery',
    ],
  },
  {
    title: 'Critical Care & Facilities',
    short: 'Critical Care',
    text: 'Ventilator, BiPAP and CPAP support, a modular operation theatre, and intensive care with continuous monitoring.',
    icon: Activity,
    items: [
      'Ventilator support',
      'BiPAP support',
      'CPAP support',
      'Ventilator ambulance',
      'Modular operation theatre',
      'Intensive Care Unit (ICU)',
      'Central oxygen supply',
      'Cardiac monitor',
      'Multiparameter monitor',
      'Defibrillator',
      'Infusion & syringe pumps',
      'Pulse oximeter',
      'Nebulizer',
      'General ward',
    ],
  },
  {
    title: 'General Facilities',
    short: 'Facilities',
    text: 'Comfort and support for patients and families throughout their stay.',
    icon: Building2,
    unit: 'facilities',
    items: [
      'Lift facility',
      'Generator backup',
      'Continuous RO drinking water',
      'Spacious parking area',
      'Single and AC rooms',
      'Ambulance service',
      'Wheelchair facility',
      'Stretcher facility',
    ],
  },
];


import { phone, phoneLabel } from '../data/contact';

// Department tabs on the left, the chosen department's full list on the right.
// Keeps every department the same footprint and shows all sub-services without tall cards.
export function ServicesSection() {
  const [active, setActive] = useState(0);
  // Phone cards open and close independently, so opening one never shifts the page by collapsing another.
  const [mobileOpen, setMobileOpen] = useState<Set<number>>(() => new Set([0]));
  const toggleMobile = (index: number) => setMobileOpen((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const department = departments[active];
  const Icon = department.icon;

  // On phones the tabs are a sideways-scrolling row: keep the chosen one in view (row only, never the page).
  useEffect(() => {
    const tab = tabRefs.current[active];
    const row = tab?.parentElement;
    if (!tab || !row || row.scrollWidth <= row.clientWidth) return;
    const offset = tab.getBoundingClientRect().left - row.getBoundingClientRect().left;
    const left = row.scrollLeft + offset - (row.clientWidth - tab.offsetWidth) / 2;
    row.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [active]);

  const select = (index: number) => {
    const next = (index + departments.length) % departments.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: departments.length - 1 };
    if (event.key in keys) {
      event.preventDefault();
      select(keys[event.key]);
    }
  };

  return (
    <section className="section services-section" id="services" aria-labelledby="services-heading">
      <div className="container">
        <div className="section-heading reveal">
          <h2 id="services-heading">Our <em>services</em></h2>
          <p>Comprehensive medical care, critical care, emergency services, surgical care and patient facilities in Sajjapuram, Tanuku.</p>
        </div>

        <div className="svc reveal">
          <div className="svc-tabs" role="tablist" aria-label="Departments" aria-orientation="vertical">
            {departments.map(({ title, short, icon: TabIcon, items, unit = 'services' }, index) => (
              <button
                key={title}
                ref={(element) => { tabRefs.current[index] = element; }}
                className="svc-tab"
                type="button"
                role="tab"
                id={`svc-tab-${index + 1}`}
                aria-selected={active === index}
                aria-controls="svc-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={onKeyDown}
                data-testid={`card-service-${index + 1}`}
              >
                <span className="svc-tab-icon"><TabIcon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="svc-tab-text">
                  <span className="svc-tab-title"><span className="svc-tab-full">{title}</span><span className="svc-tab-short" aria-hidden="true">{short}</span></span>
                  <span className="svc-tab-count">{items.length} {unit}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="svc-panel" role="tabpanel" id="svc-panel" aria-labelledby={`svc-tab-${active + 1}`} key={active}>
            <div className="svc-panel-head">
              <span className="svc-panel-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
              <div>
                <h3>{department.title}</h3>
                <p>{department.text}</p>
              </div>
            </div>
            <ul className="svc-list">
              {department.items.map((item, index) => (
                <li key={item} style={{ '--item-index': index } as React.CSSProperties}>
                  <span className="svc-check" aria-hidden="true"><Check size={12} strokeWidth={2.6} /></span>
                  {item}
                </li>
              ))}
            </ul>
            <a className="svc-call" href={`tel:${phone}`}>
              <PhoneCall size={17} aria-hidden="true" /> Call {phoneLabel} to ask about {department.title.toLowerCase()}
            </a>
          </div>
        </div>

        {/* Phones: one tidy card per department; tap to open its full list. Shown instead of the tabs below 760px. */}
        <div className="svc-acc">
          {departments.map(({ title, text, icon: ItemIcon, items, unit = 'services' }, index) => {
            const open = mobileOpen.has(index);
            // className stays constant: the scroll-reveal observer adds is-visible to the DOM, and a re-render must not wipe it. Open state lives in data-open.
            return (
              <article className="svc-acc-item reveal" data-open={open} key={title} style={{ '--motion-delay': `${index * 50}ms` } as React.CSSProperties}>
                <h3>
                  <button
                    type="button"
                    className="svc-acc-head"
                    aria-expanded={open}
                    aria-controls={`svc-acc-panel-${index + 1}`}
                    id={`svc-acc-head-${index + 1}`}
                    onClick={() => toggleMobile(index)}
                  >
                    <span className="svc-acc-icon"><ItemIcon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                    <span className="svc-acc-text">
                      <span className="svc-acc-title">{title}</span>
                      <span className="svc-acc-count">{items.length} {unit}</span>
                    </span>
                    <span className="svc-acc-chevron" aria-hidden="true"><ChevronDown size={18} strokeWidth={2.2} /></span>
                  </button>
                </h3>
                <div className="svc-acc-panel" id={`svc-acc-panel-${index + 1}`} role="region" aria-labelledby={`svc-acc-head-${index + 1}`} inert={!open}>
                  <div className="svc-acc-inner">
                    <p className="svc-acc-desc">{text}</p>
                    <ul className="svc-acc-list">
                      {items.map((item) => (
                        <li key={item}><span className="svc-check" aria-hidden="true"><Check size={11} strokeWidth={2.6} /></span>{item}</li>
                      ))}
                    </ul>
                    <a className="svc-acc-call" href={`tel:${phone}`}><PhoneCall size={16} aria-hidden="true" /> Call {phoneLabel}</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
