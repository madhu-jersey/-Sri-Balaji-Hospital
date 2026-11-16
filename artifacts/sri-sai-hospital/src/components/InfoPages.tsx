import { Fragment, useState } from 'react';
import {
  Check, ChevronDown, CreditCard, HandHeart, HeartPulse, Landmark, PhoneCall, Plus, Scissors, ShieldCheck, Siren, Stethoscope,
} from 'lucide-react';

import { phone, phoneLabel } from '../data/contact';

// Five reasons to trust the hospital, each resting on the brochure or on patients' own Google reviews.
const reasons = [
  {
    title: 'Specialist Doctor',
    text: 'Led by Dr. D. Billy Graham, M.B.B.S., M.D., who personally attends serious and critical cases.',
    icon: Stethoscope,
  },
  {
    title: '24/7 Emergency Care',
    text: 'Accidents, snakebite, poisoning and cardiac emergencies attended at any hour, every day.',
    icon: Siren,
  },
  {
    title: 'ICU & Life Support',
    text: 'Intensive care with ventilator, cardiac monitors, defibrillator and central oxygen.',
    icon: HeartPulse,
  },
  {
    title: 'Surgical Care',
    text: 'General, laparoscopic, neuro and reconstructive surgery without travelling far.',
    icon: Scissors,
  },
  {
    title: 'Honest, Fair Care',
    text: 'Reasonable rates, with only the tests and medicines you actually need.',
    icon: HandHeart,
  },
];

const insuranceFacilities = [
  {
    title: 'Medical Insurance Facilities',
    text: 'Treatment for patients covered by medical insurance.',
    icon: ShieldCheck,
  },
  {
    title: 'Cashless Insurance Facilities',
    text: 'Cashless treatment with participating insurers.',
    icon: CreditCard,
  },
  {
    title: 'Reimbursement facility for State Government employees',
    text: 'Support with reimbursement for State Government employees.',
    icon: Landmark,
  },
];

const insurancePartners = [
  'Star Health',
  'HDFC ERGO',
  'Tata AIG',
  'ICICI Lombard',
  'SBI General Insurance',
  'Royal Sundaram',
  'ManipalCigna',
  'ACKO',
  'Aditya Birla Health',
  'Future Generali',
];

const questions = [
  {
    question: 'Which hospital in Tanuku is open 24/7 for emergencies?',
    answer: (
      <>Sri Balaji Hospital in Sajjapuram, Tanuku attends emergencies 24 hours a day, every day, including accidents, snakebite, poisoning and cardiac emergencies, with an ICU and ventilator. Call <a href={`tel:${phone}`}>{phoneLabel}</a> on the way.</>
    ),
  },
  {
    question: "What are the hospital's opening hours?",
    answer: (
      <>Emergency care is available 24 hours a day, 7 days a week. Outpatient (OP) timings are Monday to Saturday, 9:30 AM – 8:30 PM, and Sunday, 10:00 AM – 8:00 PM.</>
    ),
  },
  {
    question: 'Is the hospital open at night?',
    answer: (
      <>Yes, for emergencies. Emergency care is available 24 hours a day, every day. Call <a href={`tel:${phone}`}>{phoneLabel}</a> on the way so the team can prepare. For an ambulance, call <a href="tel:108">108</a>.</>
    ),
  },
  {
    question: 'Which doctor is available at the hospital?',
    answer: <>Dr. D. Billy Graham, M.B.B.S., M.D., Critical Care Specialist (Registration No. 42113). Consultation hours are 10:00 AM – 2:00 PM and 6:00 PM – 8:30 PM. Emergency cases are attended at all times.</>,
  },
  {
    question: 'What conditions are treated?',
    answer: <>General medicine and emergency care (including snakebite, poisoning, cardiac, diabetes, blood pressure, asthma and stroke care), general surgery, neurosurgery, plastic and reconstructive surgery, laparoscopic surgery, and critical care with an ICU and ventilator. See Our services for the full list.</>,
  },
  {
    question: 'How can I book an appointment?',
    answer: (
      <>Call <a href={`tel:${phone}`}>{phoneLabel}</a> to ask about appointments and doctor availability.</>
    ),
  },
  {
    question: 'Where is Sri Balaji Hospital located?',
    answer: <>Sri Balaji Hospital, Sajjapuram, Tanuku, Andhra Pradesh 534211. Tap Directions for the route in Google Maps.</>,
  },
];

function Heading({ id, label, words, italic }: { id: string; label: string; words: string[]; italic: string }) {
  return (
    <header className="info-heading">
      <span className="eyebrow">{label}</span>
      <h2 id={id}>
        {words.map((word, index) => (
          <Fragment key={word}>
            <span className="info-heading-word" style={{ '--word-index': index } as React.CSSProperties}>
              <span>{word}</span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
        {' '}
        <em className="info-heading-word" style={{ '--word-index': words.length } as React.CSSProperties}>
          <span>{italic}</span>
        </em>
      </h2>
    </header>
  );
}

export function WhyChooseSection() {
  return (
    <section className="info-page why-choose-page" id="why-choose" aria-labelledby="why-choose-heading">
      <div className="container info-container">
        <div className="info-intro">
          <header className="info-heading why-heading">
            {/* Labelled heading as in the reference the owner supplied. */}
            <p className="why-kicker">Why choose Sri Balaji</p>
            <h2 id="why-choose-heading">Why families choose <span className="why-name">Sri Balaji</span></h2>
          </header>
          <p>Care designed around your family's needs in Sajjapuram, Tanuku.</p>
        </div>
        <ol className="why-grid">
          {reasons.map(({ title, text, icon: Icon }, index) => (
            <li className="why-item" key={title} style={{ '--item-index': index } as React.CSSProperties}>
              <Icon className="why-icon" size={26} strokeWidth={1.6} aria-hidden="true" />
              <span className="why-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function InsuranceSection() {
  return (
    <section className="info-page insurance-page" id="insurance" aria-labelledby="insurance-heading">
      <div className="container info-container">
        <div className="info-intro">
          <Heading id="insurance-heading" label="Insurance" words={['Insurance', '&']} italic="Cashless Support" />
        </div>
        <div className="reason-grid insurance-grid">
          {insuranceFacilities.map(({ title, text, icon: Icon }, index) => (
            <article className="reason-card" key={title} style={{ '--item-index': index } as React.CSSProperties}>
              <span className="reason-icon"><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="insurance-partners">
          <h3>Selected empanelled partners</h3>
          <p>Please call the hospital to confirm your insurer and policy before admission.</p>
          <ul className="insurance-partner-list">
            {insurancePartners.map((partner) => <li key={partner}>{partner}</li>)}
          </ul>
          <a className="button button-primary insurance-call" href={`tel:${phone}`}><PhoneCall size={17} aria-hidden="true" /> Call {phoneLabel}</a>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  return (
    <section className="info-page faq-page fq" id="faq" aria-labelledby="faq-heading">
      <div className="container fq-layout">
        <div className="fq-intro">
          <p className="why-kicker">FAQ</p>
          <h2 id="faq-heading">Questions, <span className="why-name">answered.</span></h2>
          <p className="fq-lead">Quick answers about emergencies, timings, the doctor and treatment at Sri Balaji Hospital.</p>
          <div className="fq-help">
            <span className="fq-help-icon"><PhoneCall size={20} strokeWidth={1.8} aria-hidden="true" /></span>
            <div>
              <p className="fq-help-title">Still have a question?</p>
              <p className="fq-help-text">Call us, day or night for emergencies.</p>
            </div>
            <a className="fq-help-call" href={`tel:${phone}`}>Call {phoneLabel}</a>
          </div>
        </div>

        <div className="fq-list">
          {questions.map(({ question, answer }, index) => {
            const isOpen = openQuestion === index;
            const answerId = `faq-answer-${index + 1}`;
            return (
              <article className={`fq-item${isOpen ? ' is-open' : ''}`} key={question} style={{ '--item-index': index } as React.CSSProperties}>
                <h3>
                  <button
                    className="fq-question"
                    id={`faq-question-${index + 1}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                  >
                    <span className="fq-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span className="fq-text">{question}</span>
                    <span className="fq-toggle" aria-hidden="true"><Plus size={18} strokeWidth={2.2} /></span>
                  </button>
                </h3>
                <div className="fq-answer" id={answerId} role="region" aria-labelledby={`faq-question-${index + 1}`} inert={!isOpen}>
                  <div className="fq-answer-inner"><p>{answer}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
