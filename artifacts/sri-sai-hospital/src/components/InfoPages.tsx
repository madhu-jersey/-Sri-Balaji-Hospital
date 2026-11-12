import { Fragment, useState } from 'react';
import {
  Check, ChevronDown, Clock3, CreditCard, Landmark, MapPin, MessageCircleHeart, PhoneCall, ShieldCheck, Star, UserCheck,
} from 'lucide-react';

const phone = '+918819221778';

// Reasons to trust the hospital, kept separate from the Services list.
// Each line rests on the doctors' listed degrees, the supplied hours, the Google rating, or the reviews shown on this page.
const reasons = [
  {
    title: 'Doctor-led care',
    text: 'Care from Dr. Billygraham Deepati, MD (General Medicine), who is also trained in anaesthesia.',
    icon: UserCheck,
  },
  {
    title: 'Open seven days',
    text: 'Monday to Saturday 9:30 AM – 8:30 PM, and Sunday 10:00 AM – 8:00 PM.',
    icon: Clock3,
  },
  {
    title: 'Rated by patients',
    text: '3.8 out of 5 from 38 Google reviews. Reviews on this site are shown as patients wrote them.',
    icon: Star,
  },
  {
    title: 'Fair, honest treatment',
    text: 'Patients’ reviews mention reasonable rates and no unnecessary lab tests or medicines.',
    icon: MessageCircleHeart,
  },
  {
    title: 'Wheelchair accessible',
    text: 'Wheelchair-accessible parking, entrance and exit.',
    icon: Check,
  },
  {
    title: 'Easy to find',
    text: 'On Rashtrapati Road, Sajjapuram, above HDFC Bank and beside Polytechnic College.',
    icon: MapPin,
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
    question: "What are the hospital's opening hours?",
    answer: (
      <>Sri Balaji Hospital is listed as open Monday to Saturday, 9:30 AM – 8:30 PM, and Sunday, 10:00 AM – 8:00 PM. Please call to confirm before visiting.</>
    ),
  },
  {
    question: 'Is the hospital open at night?',
    answer: (
      <>24-hour emergency and inpatient services are not confirmed. Please call <a href={`tel:${phone}`}>08819 221778</a> to check current availability, or call <a href="tel:112">112</a> in an emergency.</>
    ),
  },
  {
    question: 'Which doctor is available at the hospital?',
    answer: <>Dr. Billygraham Deepati, MD (General Medicine) and Anaesthesia. Listed consultation timings are Monday to Saturday, 10:00 AM – 2:00 PM and 6:00 PM – 9:00 PM, with a listed consultation fee of ₹300. Please confirm availability and the current fee before visiting.</>,
  },
  {
    question: 'What conditions are treated?',
    answer: <>Public listings mention general medicine consultation, viral fever, chest pain and abdominal pain, and anaesthesia services including adult, regional and nerve block anaesthesia. Confirm the current scope of treatment directly with the hospital.</>,
  },
  {
    question: 'How can I book an appointment?',
    answer: (
      <>Call <a href={`tel:${phone}`}>08819 221778</a> to ask about appointments and doctor availability.</>
    ),
  },
  {
    question: 'Where is Sri Balaji Hospital located?',
    answer: <>Rashtrapati Road, Sajjapuram, Tanuku, West Godavari District, Andhra Pradesh 534211. The hospital is above HDFC Bank, beside Polytechnic College.</>,
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
          <Heading id="why-choose-heading" label="Why choose us" words={['Care', 'that', 'is']} italic="close to home." />
          <p>What patients can count on at Sri Balaji Hospital.</p>
        </div>
        <div className="reason-grid">
          {reasons.map(({ title, text, icon: Icon }, index) => (
            <article className="reason-card" key={title} style={{ '--item-index': index } as React.CSSProperties}>
              <span className="reason-icon"><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="info-doctors">
          <a className="info-doctor-link" href="#doctor-billygraham"><span><Check size={17} aria-hidden="true" /> Dr. Billygraham Deepati</span><ChevronDown size={17} aria-hidden="true" /></a>
          <a className="button button-primary info-book-button" href={`tel:${phone}`}><PhoneCall size={17} aria-hidden="true" /> Call to book</a>
        </div>
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
          <a className="button button-primary insurance-call" href={`tel:${phone}`}><PhoneCall size={17} aria-hidden="true" /> Call 08819 221778</a>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <section className="info-page faq-page" id="faq" aria-labelledby="faq-heading">
      <div className="container info-container">
        <Heading id="faq-heading" label="FAQ" words={['Questions,']} italic="answered." />
        <div className="faq-list">
          {questions.map(({ question, answer }, index) => {
            const isOpen = openQuestion === index;
            const answerId = `faq-answer-${index + 1}`;
            return (
              <article className="faq-item" key={question} style={{ '--item-index': index } as React.CSSProperties}>
                <h3>
                  <button
                    className="faq-question"
                    id={`faq-question-${index + 1}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                  >
                    <span>{question}</span>
                    <ChevronDown className="faq-chevron" size={20} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className={`faq-answer${isOpen ? ' is-open' : ''}`}
                  id={answerId}
                  role="region"
                  aria-labelledby={`faq-question-${index + 1}`}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                >
                  <div className="faq-answer-inner"><p>{answer}</p></div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="faq-contact">Still have a question? <a href={`tel:${phone}`}>Call 08819 221778.</a></p>
      </div>
    </section>
  );
}
