/*
  Writes one plain-HTML page per service, an emergency page and a doctor page into dist/public,
  plus sitemap.xml. Runs after `vite build` (see package.json "build").

  Why plain HTML: search engines read the full text at once, without running JavaScript,
  and each page gets its own title, description, heading and structured data.
  Content comes from src/data/services.json and src/data/site.json, the same files the home page uses.
  Vercel serves /neurology-tanuku from neurology-tanuku.html ("cleanUrls" in vercel.json).
*/
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist', 'public');
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
const { departments } = JSON.parse(readFileSync(join(root, 'src/data/services.json'), 'utf8'));
const D = site.domain;
const today = new Date().toISOString().slice(0, 10);

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (data) => JSON.stringify(data, null, 2).replace(/</g, '\\u003c');

// Photos for the pages, copied from the gallery under stable names.
const photos = {
  icu: ['src/assets/gallery/icu/1-intensive-care-unit.jpg', 'Intensive care unit at Sri Balaji Hospital, Tanuku'],
  icu2: ['src/assets/gallery/icu/2-intensive-care-beds-and-ventilator.jpg', 'ICU beds and ventilator at Sri Balaji Hospital, Tanuku'],
  ot: ['src/assets/gallery/operation-theatre/modular-operation-theatre.jpg', 'Modular operation theatre at Sri Balaji Hospital, Tanuku'],
  consult: ['src/assets/gallery/consultation/doctors-consultation-room.jpg', 'Dr. D. Billy Graham in the consultation room at Sri Balaji Hospital, Tanuku'],
  room: ['src/assets/gallery/rooms/single-room.jpg', 'Single room at Sri Balaji Hospital, Tanuku'],
  reception: ['src/assets/gallery/reception/2-reception-and-op-waiting-hall.jpg', 'Reception and OP waiting hall at Sri Balaji Hospital, Tanuku'],
};
mkdirSync(join(out, 'assets', 'pages'), { recursive: true });
const photoUrl = {};
for (const [key, [file]] of Object.entries(photos)) {
  copyFileSync(join(root, file), join(out, 'assets', 'pages', `${key}.jpg`));
  photoUrl[key] = `/assets/pages/${key}.jpg`;
}
const pagePhoto = {
  'general-medicine-tanuku': 'consult',
  'general-surgery-tanuku': 'ot',
  'neurosurgery-tanuku': 'ot',
  'neurology-tanuku': 'icu2',
  'plastic-surgery-tanuku': 'ot',
  'laparoscopic-surgery-tanuku': 'ot',
  'icu-critical-care-tanuku': 'icu',
  'hospital-facilities-tanuku': 'room',
};
// schema.org MedicalSpecialty values, where one fits.
const specialty = {
  'general-medicine-tanuku': 'PrimaryCare',
  'general-surgery-tanuku': 'Surgical',
  'neurosurgery-tanuku': 'Surgical',
  'neurology-tanuku': 'Neurologic',
  'plastic-surgery-tanuku': 'PlasticSurgery',
  'laparoscopic-surgery-tanuku': 'Surgical',
  'icu-critical-care-tanuku': 'Emergency',
};

const hospitalRef = { '@id': `${D}/#hospital` };
const tel = (number, label, cls = '') => `<a class="${cls}" href="tel:${number}">${esc(label)}</a>`;
const bothNumbers = `${tel(site.phone, site.phoneLabel)} or ${tel(site.phone2, site.phone2Label)}`;

// Every page links to every other page.
const allPages = [
  { slug: 'emergency-hospital-tanuku', label: '24/7 Emergency hospital' },
  ...departments.map((d) => ({ slug: d.slug, label: d.short })),
  { slug: 'dr-d-billy-graham', label: `${site.doctor.name}` },
];

function sideLinks(current) {
  return allPages.map(({ slug, label }) => (slug === current
    ? `<li><span aria-current="page">${esc(label)}</span></li>`
    : `<li><a href="/${slug}">${esc(label)}</a></li>`)).join('\n            ');
}

function faqBlock(faqs) {
  if (!faqs?.length) return '';
  return `
        <section class="pg-section" aria-labelledby="faq-title">
          <h2 id="faq-title">Questions</h2>
          ${faqs.map(({ q, a }) => `<details class="pg-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n          ')}
        </section>`;
}

function visitBlock() {
  return `
        <section class="pg-section pg-visit" aria-labelledby="visit-title">
          <h2 id="visit-title">Hours and location</h2>
          <dl class="pg-hours">
            <div><dt>Emergency</dt><dd>${esc(site.hours.emergency)}</dd></div>
            <div><dt>OP timings</dt><dd>${esc(site.hours.opWeekdays)}<br />${esc(site.hours.opSunday)}</dd></div>
            <div><dt>Doctor consultation</dt><dd>${esc(site.hours.consultation)}</dd></div>
            <div><dt>Address</dt><dd>${esc(site.address.full)}</dd></div>
            <div><dt>Phone</dt><dd>${bothNumbers}</dd></div>
          </dl>
          <a class="pg-btn pg-btn-outline" href="${esc(site.directions)}" target="_blank" rel="noopener">Get directions in Google Maps</a>
        </section>`;
}

function trustBlock() {
  return `
        <section class="pg-section" aria-labelledby="why-title">
          <h2 id="why-title">Why families choose Sri Balaji Hospital</h2>
          <ul class="pg-why">
            <li><strong>24/7 emergency care.</strong> Accidents, snakebite, poisoning, burns, stroke and cardiac emergencies are attended at any hour.</li>
            <li><strong>Specialist doctor.</strong> ${esc(site.doctor.name)}, ${esc(site.doctor.degree)}, ${esc(site.doctor.specialty)}, ${esc(site.doctor.experience)} of experience.</li>
            <li><strong>ICU and life support.</strong> Ventilator, BiPAP and CPAP support, cardiac monitors, defibrillator and central oxygen, plus a ventilator ambulance.</li>
            <li><strong>Insurance.</strong> All health insurance cases handled; cashless treatment available.</li>
            <li><strong>Serving Tanuku since ${esc(site.founded)}.</strong> In Sajjapuram, Tanuku, West Godavari.</li>
          </ul>
        </section>`;
}

function layout({ slug, title, description, h1, crumb, image, imageAlt, body, schema }) {
  const url = `${D}/${slug}`;
  const imageAbs = `${D}${image}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="geo.region" content="IN-AP" />
  <meta name="geo.placename" content="Tanuku" />
  <meta property="og:site_name" content="Sri Balaji Hospital, Tanuku" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${imageAbs}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#082A6B" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" />
  <link rel="stylesheet" href="/assets/pages/pages.css" />
${schema.map((s) => `  <script type="application/ld+json">\n${json(s)}\n  </script>`).join('\n')}
</head>
<body>
  <a class="pg-skip" href="#main">Skip to content</a>
  <header class="pg-header">
    <div class="pg-wrap pg-header-inner">
      <a class="pg-brand" href="/" aria-label="Sri Balaji Hospital home">
        <img src="/icon-192.png" alt="" width="40" height="40" />
        <span><strong>Sri Balaji Hospital</strong><small>Sajjapuram · Tanuku</small></span>
      </a>
      <nav class="pg-nav" aria-label="Main">
        <a href="/#services">Services</a>
        <a href="/emergency-hospital-tanuku">Emergency</a>
        <a href="/dr-d-billy-graham">Doctor</a>
        <a href="/#gallery">Hospital</a>
        <a href="/#visit">Visit us</a>
      </nav>
      <a class="pg-btn pg-btn-solid pg-header-call" href="tel:${site.phone}">Call ${esc(site.phoneLabel)}</a>
    </div>
  </header>

  <main id="main">
    <div class="pg-hero">
      <div class="pg-wrap">
        <nav class="pg-crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span aria-hidden="true">›</span> ${crumb ? `<a href="/#services">Services</a> <span aria-hidden="true">›</span> ` : ''}<span aria-current="page">${esc(crumb || h1)}</span>
        </nav>
        <p class="pg-pill"><span aria-hidden="true"></span> Emergency 24/7 · Sajjapuram, Tanuku</p>
        <h1>${esc(h1)}</h1>
        <div class="pg-hero-actions">
          <a class="pg-btn pg-btn-solid" href="tel:${site.phone}">Call ${esc(site.phoneLabel)}</a>
          <a class="pg-btn pg-btn-outline" href="tel:${site.phone2}">Call ${esc(site.phone2Label)}</a>
        </div>
      </div>
    </div>

    <div class="pg-wrap pg-grid">
      <article class="pg-article">
${body}
      </article>

      <aside class="pg-aside" aria-label="Contact and other services">
        <div class="pg-card pg-card-call">
          <p class="pg-card-title">Emergency, any time</p>
          <p>Call on the way so the team can prepare.</p>
          ${tel(site.phone, `Call ${site.phoneLabel}`, 'pg-btn pg-btn-solid')}
          ${tel(site.phone2, `Call ${site.phone2Label}`, 'pg-btn pg-btn-outline')}
          <p class="pg-small">For an ambulance, call <a href="tel:108">108</a>.</p>
        </div>
        <nav class="pg-card" aria-label="Other services">
          <p class="pg-card-title">Services in Tanuku</p>
          <ul class="pg-links">
            ${sideLinks(slug)}
          </ul>
        </nav>
      </aside>
    </div>

    <figure class="pg-wrap pg-photo">
      <img src="${image}" alt="${esc(imageAlt)}" loading="lazy" decoding="async" />
    </figure>
  </main>

  <footer class="pg-footer">
    <div class="pg-wrap">
      <p class="pg-footer-name">Sri Balaji Hospital <span lang="te">${esc(site.nameTelugu)}</span></p>
      <p>${esc(site.address.full)} · ${bothNumbers}</p>
      <nav class="pg-footer-links" aria-label="All pages">
        <a href="/">Home</a>
        ${allPages.map(({ slug: s, label }) => `<a href="/${s}">${esc(label)}</a>`).join('\n        ')}
        <a href="/#faq">FAQ</a>
      </nav>
      <p class="pg-small">© ${new Date().getFullYear()} Sri Balaji Hospital, Tanuku. Serving Tanuku since ${esc(site.founded)}.</p>
    </div>
  </footer>

  <div class="pg-callbar">
    <a href="tel:${site.phone}">Call ${esc(site.phoneLabel)}</a>
    <a href="${esc(site.directions)}" target="_blank" rel="noopener">Directions</a>
  </div>
</body>
</html>
`;
}

function pageSchema({ slug, title, description, h1, crumb, faqs, extra = [], specialtyValue }) {
  const url = `${D}/${slug}`;
  const crumbs = [{ name: 'Home', item: `${D}/` }];
  if (crumb) crumbs.push({ name: 'Services', item: `${D}/#services` });
  crumbs.push({ name: crumb || h1, item: url });
  const list = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${D}/#website` },
      about: hospitalRef,
      ...(specialtyValue ? { specialty: `https://schema.org/${specialtyValue}` } : {}),
      lastReviewed: today,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
    },
    ...extra,
  ];
  if (faqs?.length) {
    list.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return list;
}

const written = [];
function emit(slug, html) {
  writeFileSync(join(out, `${slug}.html`), html);
  written.push(slug);
}

// ---------- Department pages ----------
for (const d of departments) {
  const p = d.page;
  const photo = pagePhoto[d.slug] ?? 'reception';
  const isFacilities = d.slug === 'hospital-facilities-tanuku';
  const body = `
        <section class="pg-section pg-intro">
          ${p.intro.map((para) => `<p>${esc(para)}</p>`).join('\n          ')}
        </section>
        <section class="pg-section" aria-labelledby="list-title">
          <h2 id="list-title">${isFacilities ? 'Facilities' : `${esc(d.title)} services`}</h2>
          <ul class="pg-checks">
            ${d.items.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </section>${trustBlock()}${visitBlock()}${faqBlock(p.faqs)}`;
  emit(d.slug, layout({
    slug: d.slug,
    title: p.title,
    description: p.description,
    h1: p.h1,
    crumb: d.title,
    image: photoUrl[photo],
    imageAlt: photos[photo][1],
    body,
    schema: pageSchema({ slug: d.slug, title: p.title, description: p.description, h1: p.h1, crumb: d.title, faqs: p.faqs, specialtyValue: specialty[d.slug] }),
  }));
}

// ---------- Emergency page (main target: "emergency hospital in Tanuku") ----------
{
  const slug = 'emergency-hospital-tanuku';
  const title = '24/7 Emergency Hospital in Tanuku | Sri Balaji Hospital, Sajjapuram';
  const description = `24/7 emergency hospital in Tanuku with ICU, ventilator, BiPAP and a ventilator ambulance. Accidents, snakebite, poisoning, burns, stroke and cardiac emergencies. Call ${site.phoneLabel} or ${site.phone2Label}.`;
  const h1 = '24/7 Emergency Hospital in Tanuku';
  const faqs = [
    { q: 'Which hospital in Tanuku is open 24/7 for emergencies?', a: `Sri Balaji Hospital in Sajjapuram, Tanuku attends emergencies 24 hours a day, every day, including accidents, snakebite, poisoning and cardiac emergencies, with an ICU and ventilator. Call ${site.phoneLabel} or ${site.phone2Label} on the way.` },
    { q: 'Is the emergency open at night and on Sundays?', a: 'Yes. Emergency care is available 24 hours a day, 7 days a week, including nights, Sundays and holidays.' },
    { q: 'Do you have a ventilator ambulance?', a: `Yes. A ventilator ambulance is available. Call ${site.phoneLabel} or ${site.phone2Label}. For a government ambulance, call 108.` },
    { q: 'Is cashless insurance accepted for emergencies?', a: 'We handle all health insurance cases and cashless treatment is available. Bring the policy details with you, or call and the desk will confirm your coverage.' },
  ];
  const emergencies = ['Road accidents and injuries', 'Head injuries', 'Snakebite', 'Poisoning', 'Burns', 'Cardiac emergencies', 'Stroke and sudden paralysis', 'Seizures (fits)', 'Breathing difficulty and asthma attacks', 'High fever'];
  const ready = ['Intensive Care Unit (ICU)', 'Ventilator, BiPAP and CPAP support', 'Ventilator ambulance', 'Cardiac and multiparameter monitors', 'Defibrillator', 'Central oxygen supply', 'Modular operation theatre', 'Critical Care Specialist on call'];
  const body = `
        <section class="pg-section pg-intro">
          <p>Sri Balaji Hospital in Sajjapuram, Tanuku is open for emergencies <strong>24 hours a day, 7 days a week</strong>. Emergency and critical care is led by ${esc(site.doctor.name)}, ${esc(site.doctor.degree)}, a ${esc(site.doctor.specialty)} with ${esc(site.doctor.experience)} of experience, who personally attends serious and critical cases.</p>
          <p>The hospital has an ICU with ventilator, BiPAP and CPAP support, a modular operation theatre and a ventilator ambulance, so patients can be stabilised, monitored and operated on in one place.</p>
        </section>
        <section class="pg-section pg-steps" aria-labelledby="steps-title">
          <h2 id="steps-title">In an emergency</h2>
          <ol>
            <li><strong>Call on the way:</strong> ${bothNumbers}, so the team is ready when you arrive.</li>
            <li><strong>Need an ambulance?</strong> Ask for the ventilator ambulance on the same numbers, or call <a href="tel:108">108</a>.</li>
            <li><strong>Come straight in:</strong> ${esc(site.address.full)}. <a href="${esc(site.directions)}" target="_blank" rel="noopener">Directions in Google Maps</a>.</li>
          </ol>
        </section>
        <section class="pg-section" aria-labelledby="list-title">
          <h2 id="list-title">Emergencies attended day and night</h2>
          <ul class="pg-checks">
            ${emergencies.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </section>
        <section class="pg-section" aria-labelledby="ready-title">
          <h2 id="ready-title">Ready when you arrive</h2>
          <ul class="pg-checks">
            ${ready.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
          <p>See <a href="/icu-critical-care-tanuku">ICU and critical care</a>, <a href="/neurosurgery-tanuku">neurosurgery for head injuries</a>, <a href="/neurology-tanuku">neurology for stroke and fits</a> and <a href="/general-medicine-tanuku">general medicine for snakebite and poisoning</a>.</p>
        </section>${trustBlock()}${visitBlock()}${faqBlock(faqs)}`;
  const emergencyService = {
    '@context': 'https://schema.org',
    '@type': 'EmergencyService',
    '@id': `${D}/${slug}#emergency`,
    name: 'Sri Balaji Hospital – 24/7 Emergency',
    url: `${D}/${slug}`,
    telephone: '+91-98857-71197',
    parentOrganization: hospitalRef,
    address: { '@type': 'PostalAddress', streetAddress: site.address.locality, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: 'IN' },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    areaServed: [{ '@type': 'City', name: 'Tanuku' }, { '@type': 'AdministrativeArea', name: 'West Godavari' }],
  };
  emit(slug, layout({
    slug, title, description, h1, crumb: null,
    image: photoUrl.icu, imageAlt: photos.icu[1], body,
    schema: pageSchema({ slug, title, description, h1, faqs, extra: [emergencyService], specialtyValue: 'Emergency' }),
  }));
}

// ---------- Doctor page ----------
{
  const slug = 'dr-d-billy-graham';
  const doc = site.doctor;
  const title = `${doc.name}, M.D. | ${doc.specialty} in Tanuku`;
  const description = `${doc.name}, ${doc.degree}, ${doc.specialty} at Sri Balaji Hospital, Sajjapuram, Tanuku. ${doc.experience} of experience. ${doc.registration}. Consultation ${site.hours.consultation}.`;
  const h1 = `${doc.name}, ${doc.degree}`;
  const areas = ['Emergency care', 'Critical care & ICU', 'General medicine', 'Snakebite & poisoning', 'Cardiac care', 'Diabetes & blood pressure'];
  const faqs = [
    { q: `What are ${doc.name}'s consultation hours?`, a: `Consultation hours are ${site.hours.consultation}. Emergency cases are attended at all times.` },
    { q: `How do I book with ${doc.name}?`, a: `Call ${site.phoneLabel} or ${site.phone2Label} to ask about appointments and doctor availability.` },
  ];
  const body = `
        <section class="pg-section pg-doctor">
          <img src="/assets/dr-billygraham-deepati.webp" alt="${esc(doc.name)} at the consultation desk" width="864" height="1080" loading="lazy" decoding="async" />
          <div>
            <p class="pg-eyebrow">${esc(doc.specialty)}</p>
            <p>${esc(doc.name)}, ${esc(doc.degree)}, leads emergency, critical care and general medicine at Sri Balaji Hospital in Sajjapuram, Tanuku, and personally attends serious and critical cases.</p>
            <dl class="pg-hours">
              <div><dt>Experience</dt><dd>${esc(doc.experience)}</dd></div>
              <div><dt>Registration</dt><dd>${esc(doc.registration)}</dd></div>
              <div><dt>Consultation</dt><dd>${esc(site.hours.consultation)}</dd></div>
              <div><dt>Emergency</dt><dd>24 hours, 7 days</dd></div>
            </dl>
          </div>
        </section>
        <section class="pg-section" aria-labelledby="list-title">
          <h2 id="list-title">Areas of care</h2>
          <ul class="pg-checks">
            ${areas.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </section>${visitBlock()}${faqBlock(faqs)}`;
  const physician = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${D}/${slug}#physician`,
    name: doc.name,
    honorificSuffix: doc.degree,
    description: `${doc.specialty}, ${doc.registration}, ${doc.experience} of experience`,
    image: `${D}/assets/dr-billygraham-deepati.webp`,
    url: `${D}/${slug}`,
    telephone: '+91-98857-71197',
    medicalSpecialty: 'https://schema.org/Emergency',
    hospitalAffiliation: hospitalRef,
    address: { '@type': 'PostalAddress', streetAddress: site.address.locality, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: 'IN' },
  };
  emit(slug, layout({
    slug, title, description, h1, crumb: null,
    image: photoUrl.consult, imageAlt: photos.consult[1], body,
    schema: pageSchema({ slug, title, description, h1, faqs, extra: [physician] }),
  }));
}

// ---------- Styles shared by the pages ----------
writeFileSync(join(out, 'assets', 'pages', 'pages.css'), readFileSync(join(root, 'scripts', 'pages.css'), 'utf8'));

// ---------- Sitemap ----------
const urls = [{ loc: `${D}/`, priority: '1.0' }, ...written.map((slug) => ({ loc: `${D}/${slug}`, priority: slug === 'emergency-hospital-tanuku' ? '0.9' : '0.8' }))];
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`);

console.log(`build-pages: wrote ${written.length} pages and sitemap.xml (${urls.length} URLs)`);
