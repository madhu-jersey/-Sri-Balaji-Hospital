/*
  Writes the service pages into dist/public after `vite build` (see package.json "build"):
    - one page per department, plus /emergency-hospital-tanuku and /dr-d-billy-graham, in English
    - the same pages in Telugu under /te/ (for example /te/neurology-tanuku)
    - sitemap.xml with both languages
  Plain HTML, so search engines read the full text without running JavaScript; each page has its own
  title, description, heading and structured data, and hreflang links between its English and Telugu versions.
  Content comes from src/data/services.json (each department's "te" block holds its Telugu) and src/data/site.json.
  The English | తెలుగు switch saves the choice in localStorage ("sbh-lang"), the same key the home page reads.
  Vercel serves /neurology-tanuku from neurology-tanuku.html ("cleanUrls" in vercel.json).
*/
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist', 'public');
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
const { departments } = JSON.parse(readFileSync(join(root, 'src/data/services.json'), 'utf8'));
const uiTe = JSON.parse(readFileSync(join(root, 'src/i18n/te.json'), 'utf8'));
const D = site.domain;
const today = new Date().toISOString().slice(0, 10);
const year = new Date().getFullYear();

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (data) => JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
const path = (lang, slug) => (lang === 'te' ? `/te/${slug}` : `/${slug}`);

// ---------- Words used by the page template, in both languages ----------
const L = {
  en: {
    htmlLang: 'en', inLanguage: 'en-IN', ogLocale: 'en_IN',
    skip: 'Skip to content', homeAria: 'Sri Balaji Hospital home', brand: 'Sri Balaji Hospital', brandSub: 'Sajjapuram · Tanuku',
    nav: { services: 'Services', emergency: 'Emergency', doctor: 'Doctor', hospital: 'Hospital', visit: 'Visit us' },
    call: (n) => `Call ${n}`, or: 'or', home: 'Home', servicesCrumb: 'Services', breadcrumb: 'Breadcrumb', mainNav: 'Main', language: 'Language',
    pill: 'Emergency 24/7 · Sajjapuram, Tanuku',
    asideLabel: 'Contact and other services', asideTitle: 'Emergency, any time', asidePrep: 'Call on the way so the team can prepare.',
    ambulance: 'For an ambulance, call <a href="tel:108">108</a>.', servicesInTanuku: 'Services in Tanuku', otherServices: 'Other services',
    listTitle: (title, facilities) => (facilities ? 'Facilities' : `${title} services`),
    whyTitle: 'Why families choose Sri Balaji Hospital',
    why: [
      ['24/7 emergency care.', 'Accidents, snakebite, poisoning, burns, stroke and cardiac emergencies are attended at any hour.'],
      ['Specialist doctor.', `${site.doctor.name}, ${site.doctor.degree}, ${site.doctor.specialty}, ${site.doctor.experience} of experience.`],
      ['ICU and life support.', 'Ventilator, BiPAP and CPAP support, cardiac monitors, defibrillator and central oxygen, plus a ventilator ambulance.'],
      ['Insurance.', 'All health insurance cases handled; cashless treatment available.'],
      [`Serving Tanuku since ${site.founded}.`, 'In Sajjapuram, Tanuku, West Godavari.'],
    ],
    visitTitle: 'Hours and location',
    hours: [
      ['Emergency', site.hours.emergency],
      ['OP timings', `${site.hours.opWeekdays}<br />${site.hours.opSunday}`],
      ['Doctor consultation', site.hours.consultation],
      ['Address', esc(site.address.full)],
    ],
    phoneLabel: 'Phone', directionsLong: 'Get directions in Google Maps', directionsShort: 'Directions', faqTitle: 'Questions',
    allPages: 'All pages', faqLink: 'FAQ', copyright: `© ${year} Sri Balaji Hospital, Tanuku. Serving Tanuku since ${site.founded}.`,
    footerName: 'Sri Balaji Hospital', footerAlt: site.nameTelugu, footerAltLang: 'te', address: site.address.full,
    pageLabels: { emergency: '24/7 Emergency hospital', doctor: site.doctor.name },
    photos: {
      icu: 'Intensive care unit at Sri Balaji Hospital, Tanuku',
      icu2: 'ICU beds and ventilator at Sri Balaji Hospital, Tanuku',
      ot: 'Modular operation theatre at Sri Balaji Hospital, Tanuku',
      consult: 'Dr. D. Billy Graham in the consultation room at Sri Balaji Hospital, Tanuku',
      room: 'Single room at Sri Balaji Hospital, Tanuku',
      reception: 'Reception and OP waiting hall at Sri Balaji Hospital, Tanuku',
    },
  },
  te: {
    htmlLang: 'te', inLanguage: 'te-IN', ogLocale: 'te_IN',
    skip: 'ప్రధాన విషయానికి వెళ్లండి', homeAria: 'శ్రీ బాలాజీ హాస్పిటల్ హోమ్ పేజీ', brand: 'శ్రీ బాలాజీ హాస్పిటల్', brandSub: 'సజ్జాపురం · తణుకు',
    nav: { services: 'సేవలు', emergency: 'అత్యవసర సేవలు', doctor: 'డాక్టర్', hospital: 'హాస్పిటల్', visit: 'చిరునామా' },
    call: (n) => `${n} కు కాల్ చేయండి`, or: 'లేదా', home: 'హోమ్', servicesCrumb: 'సేవలు', breadcrumb: 'పేజీ మార్గం', mainNav: 'ప్రధాన మెనూ', language: 'భాష',
    pill: 'అత్యవసర సేవలు 24/7 · సజ్జాపురం, తణుకు',
    asideLabel: 'సంప్రదింపు మరియు ఇతర సేవలు', asideTitle: 'అత్యవసరమా? ఎప్పుడైనా కాల్ చేయండి', asidePrep: 'బృందం సిద్ధంగా ఉండేలా వచ్చే దారిలోనే కాల్ చేయండి.',
    ambulance: 'అంబులెన్స్ కోసం <a href="tel:108">108</a> కు కాల్ చేయండి.', servicesInTanuku: 'తణుకులో మా సేవలు', otherServices: 'ఇతర సేవలు',
    listTitle: (title, facilities) => (facilities ? 'సౌకర్యాలు' : `${title} – సేవలు`),
    whyTitle: 'కుటుంబాలు శ్రీ బాలాజీ హాస్పిటల్‌ను ఎందుకు ఎంచుకుంటాయి',
    why: [
      ['24/7 అత్యవసర చికిత్స.', 'ప్రమాదాలు, పాముకాటు, విషప్రయోగం, కాలిన గాయాలు, స్ట్రోక్ మరియు గుండె సంబంధిత అత్యవసర పరిస్థితులకు ఏ సమయంలోనైనా చికిత్స.'],
      ['నిపుణులైన డాక్టర్.', 'డా. డి. బిల్లీ గ్రాహం, M.B.B.S., M.D., క్రిటికల్ కేర్ స్పెషలిస్ట్, 25 సంవత్సరాల అనుభవం.'],
      ['ఐసీయూ మరియు లైఫ్ సపోర్ట్.', 'వెంటిలేటర్, బైపాప్ మరియు సీపాప్ సపోర్ట్, కార్డియాక్ మానిటర్లు, డీఫిబ్రిలేటర్, సెంట్రల్ ఆక్సిజన్ మరియు వెంటిలేటర్ అంబులెన్స్.'],
      ['ఇన్సూరెన్స్.', 'అన్ని హెల్త్ ఇన్సూరెన్స్ కేసులను చూస్తాం; క్యాష్‌లెస్ చికిత్స అందుబాటులో ఉంది.'],
      [`${site.founded} నుండి తణుకు ప్రజల సేవలో.`, 'సజ్జాపురం, తణుకు, పశ్చిమ గోదావరి జిల్లా.'],
    ],
    visitTitle: 'సమయాలు మరియు చిరునామా',
    hours: [
      ['అత్యవసర సేవలు', '24 గంటలు, 7 రోజులు'],
      ['ఓపీ సమయాలు', 'సోమవారం – శనివారం, ఉదయం 9:30 – రాత్రి 8:30<br />ఆదివారం, ఉదయం 10:00 – రాత్రి 8:00'],
      ['డాక్టర్ కన్సల్టేషన్', 'ఉదయం 10:00 – మధ్యాహ్నం 2:00, సాయంత్రం 6:00 – రాత్రి 8:30'],
      ['చిరునామా', 'శ్రీ బాలాజీ హాస్పిటల్, సజ్జాపురం, తణుకు, ఆంధ్రప్రదేశ్ 534211'],
    ],
    phoneLabel: 'ఫోన్', directionsLong: 'Google Maps లో దారి చూడండి', directionsShort: 'దారి', faqTitle: 'ప్రశ్నలు',
    allPages: 'అన్ని పేజీలు', faqLink: 'సందేహాలు', copyright: `© ${year} శ్రీ బాలాజీ హాస్పిటల్, తణుకు. ${site.founded} నుండి తణుకు ప్రజల సేవలో.`,
    footerName: 'శ్రీ బాలాజీ హాస్పిటల్', footerAlt: 'Sri Balaji Hospital', footerAltLang: 'en', address: 'శ్రీ బాలాజీ హాస్పిటల్, సజ్జాపురం, తణుకు, ఆంధ్రప్రదేశ్ 534211',
    pageLabels: { emergency: '24/7 అత్యవసర హాస్పిటల్', doctor: 'డా. డి. బిల్లీ గ్రాహం' },
    photos: {
      icu: 'శ్రీ బాలాజీ హాస్పిటల్, తణుకులోని ఇంటెన్సివ్ కేర్ యూనిట్ (ఐసీయూ)',
      icu2: 'శ్రీ బాలాజీ హాస్పిటల్, తణుకులో ఐసీయూ బెడ్లు మరియు వెంటిలేటర్',
      ot: 'శ్రీ బాలాజీ హాస్పిటల్, తణుకులోని మాడ్యులర్ ఆపరేషన్ థియేటర్',
      consult: 'శ్రీ బాలాజీ హాస్పిటల్, తణుకులో కన్సల్టేషన్ గదిలో డా. డి. బిల్లీ గ్రాహం',
      room: 'శ్రీ బాలాజీ హాస్పిటల్, తణుకులోని సింగిల్ రూమ్',
      reception: 'శ్రీ బాలాజీ హాస్పిటల్, తణుకులోని రిసెప్షన్ మరియు ఓపీ వెయిటింగ్ హాల్',
    },
  },
};

// ---------- Photos, copied from the gallery under stable names ----------
const photoFiles = {
  icu: 'src/assets/gallery/icu/1-intensive-care-unit.jpg',
  icu2: 'src/assets/gallery/icu/2-intensive-care-beds-and-ventilator.jpg',
  ot: 'src/assets/gallery/operation-theatre/modular-operation-theatre.jpg',
  consult: 'src/assets/gallery/consultation/doctors-consultation-room.jpg',
  room: 'src/assets/gallery/rooms/single-room.jpg',
  reception: 'src/assets/gallery/reception/2-reception-and-op-waiting-hall.jpg',
};
mkdirSync(join(out, 'assets', 'pages'), { recursive: true });
mkdirSync(join(out, 'te'), { recursive: true });
for (const [key, file] of Object.entries(photoFiles)) copyFileSync(join(root, file), join(out, 'assets', 'pages', `${key}.jpg`));
const photoUrl = (key) => `/assets/pages/${key}.jpg`;

const pagePhoto = {
  'general-medicine-tanuku': 'consult', 'general-surgery-tanuku': 'ot', 'neurosurgery-tanuku': 'ot', 'neurology-tanuku': 'icu2',
  'plastic-surgery-tanuku': 'ot', 'laparoscopic-surgery-tanuku': 'ot', 'icu-critical-care-tanuku': 'icu', 'hospital-facilities-tanuku': 'room',
};
// schema.org MedicalSpecialty values, where one fits.
const specialty = {
  'general-medicine-tanuku': 'PrimaryCare', 'general-surgery-tanuku': 'Surgical', 'neurosurgery-tanuku': 'Surgical', 'neurology-tanuku': 'Neurologic',
  'plastic-surgery-tanuku': 'PlasticSurgery', 'laparoscopic-surgery-tanuku': 'Surgical', 'icu-critical-care-tanuku': 'Emergency',
};
const hospitalRef = { '@id': `${D}/#hospital` };
const postalAddress = { '@type': 'PostalAddress', streetAddress: site.address.locality, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: 'IN' };

const tel = (number, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="tel:${number}">${esc(label)}</a>`;
const bothNumbers = (t) => `${tel(site.phone, site.phoneLabel)} ${t.or} ${tel(site.phone2, site.phone2Label)}`;

function pageList(lang) {
  const t = L[lang];
  return [
    { slug: 'emergency-hospital-tanuku', label: t.pageLabels.emergency },
    ...departments.map((d) => ({ slug: d.slug, label: lang === 'te' ? d.te.short : d.short })),
    { slug: 'dr-d-billy-graham', label: t.pageLabels.doctor },
  ];
}

function sideLinks(lang, current) {
  return pageList(lang).map(({ slug, label }) => (slug === current
    ? `<li><span aria-current="page">${esc(label)}</span></li>`
    : `<li><a href="${path(lang, slug)}">${esc(label)}</a></li>`)).join('\n            ');
}

const faqBlock = (t, faqs) => (faqs?.length ? `
        <section class="pg-section" aria-labelledby="faq-title">
          <h2 id="faq-title">${esc(t.faqTitle)}</h2>
          ${faqs.map(({ q, a }) => `<details class="pg-faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n          ')}
        </section>` : '');

const visitBlock = (t) => `
        <section class="pg-section pg-visit" aria-labelledby="visit-title">
          <h2 id="visit-title">${esc(t.visitTitle)}</h2>
          <dl class="pg-hours">
            ${t.hours.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('\n            ')}
            <div><dt>${esc(t.phoneLabel)}</dt><dd>${bothNumbers(t)}</dd></div>
          </dl>
          <a class="pg-btn pg-btn-outline" href="${esc(site.directions)}" target="_blank" rel="noopener">${esc(t.directionsLong)}</a>
        </section>`;

const trustBlock = (t) => `
        <section class="pg-section" aria-labelledby="why-title">
          <h2 id="why-title">${esc(t.whyTitle)}</h2>
          <ul class="pg-why">
            ${t.why.map(([lead, rest]) => `<li><strong>${esc(lead)}</strong> ${esc(rest)}</li>`).join('\n            ')}
          </ul>
        </section>`;

function layout({ lang, slug, title, description, h1, crumb, photo, imageOverride, body, schema }) {
  const t = L[lang];
  const url = `${D}${path(lang, slug)}`;
  // The photo is used only as the preview image when the page is shared (og:image); it is not shown on the page (owner's request).
  const image = imageOverride ?? photoUrl(photo);
  const toggle = (cls) => `<div class="pg-lang${cls}" role="group" aria-label="${esc(t.language)}">
        <a href="${path('en', slug)}" lang="en" hreflang="en"${lang === 'en' ? ' aria-current="true"' : ''} onclick="try{localStorage.setItem('sbh-lang','en')}catch(e){}">English</a>
        <a href="${path('te', slug)}" lang="te" hreflang="te"${lang === 'te' ? ' aria-current="true"' : ''} onclick="try{localStorage.setItem('sbh-lang','te')}catch(e){}">తెలుగు</a>
      </div>`;
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${D}${path('en', slug)}" />
  <link rel="alternate" hreflang="te" href="${D}${path('te', slug)}" />
  <link rel="alternate" hreflang="x-default" href="${D}${path('en', slug)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="geo.region" content="IN-AP" />
  <meta name="geo.placename" content="Tanuku" />
  <meta property="og:site_name" content="Sri Balaji Hospital, Tanuku" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="${t.ogLocale}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${D}${image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#082A6B" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" />
  <link rel="stylesheet" href="/assets/pages/pages.css" />
  <!-- The language of this page becomes the visitor's choice, so the home page opens in the same language. -->
  <script>try{localStorage.setItem('sbh-lang','${lang}')}catch(e){}</script>
${schema.map((s) => `  <script type="application/ld+json">\n${json(s)}\n  </script>`).join('\n')}
</head>
<body>
  <a class="pg-skip" href="#main">${esc(t.skip)}</a>
  <header class="pg-header">
    <div class="pg-wrap pg-header-inner">
      <a class="pg-brand" href="/" aria-label="${esc(t.homeAria)}">
        <img src="/icon-192.png" alt="" width="40" height="40" />
        <span><strong>${esc(t.brand)}</strong><small>${esc(t.brandSub)}</small></span>
      </a>
      <nav class="pg-nav" aria-label="${esc(t.mainNav)}">
        <a href="/#services">${esc(t.nav.services)}</a>
        <a href="${path(lang, 'emergency-hospital-tanuku')}">${esc(t.nav.emergency)}</a>
        <a href="${path(lang, 'dr-d-billy-graham')}">${esc(t.nav.doctor)}</a>
        <a href="/#gallery">${esc(t.nav.hospital)}</a>
        <a href="/#visit">${esc(t.nav.visit)}</a>
      </nav>
      ${toggle('')}
      <a class="pg-btn pg-btn-solid pg-header-call" href="tel:${site.phone}">${esc(t.call(site.phoneLabel))}</a>
    </div>
  </header>

  <main id="main">
    <div class="pg-hero">
      <div class="pg-wrap">
        <nav class="pg-crumbs" aria-label="${esc(t.breadcrumb)}">
          <a href="/">${esc(t.home)}</a> <span aria-hidden="true">›</span> ${crumb ? `<a href="/#services">${esc(t.servicesCrumb)}</a> <span aria-hidden="true">›</span> ` : ''}<span aria-current="page">${esc(crumb || h1)}</span>
        </nav>
        <p class="pg-pill"><span aria-hidden="true"></span> ${esc(t.pill)}</p>
        <h1>${esc(h1)}</h1>
        <div class="pg-hero-actions">
          ${tel(site.phone, t.call(site.phoneLabel), 'pg-btn pg-btn-solid')}
          ${tel(site.phone2, t.call(site.phone2Label), 'pg-btn pg-btn-outline')}
        </div>
      </div>
    </div>

    <div class="pg-wrap pg-grid">
      <article class="pg-article">
${body}
      </article>

      <aside class="pg-aside" aria-label="${esc(t.asideLabel)}">
        <div class="pg-card pg-card-call">
          <p class="pg-card-title">${esc(t.asideTitle)}</p>
          <p>${esc(t.asidePrep)}</p>
          ${tel(site.phone, t.call(site.phoneLabel), 'pg-btn pg-btn-solid')}
          ${tel(site.phone2, t.call(site.phone2Label), 'pg-btn pg-btn-outline')}
          <p class="pg-small">${t.ambulance}</p>
        </div>
        <nav class="pg-card" aria-label="${esc(t.otherServices)}">
          <p class="pg-card-title">${esc(t.servicesInTanuku)}</p>
          <ul class="pg-links">
            ${sideLinks(lang, slug)}
          </ul>
        </nav>
      </aside>
    </div>
  </main>

  <footer class="pg-footer">
    <div class="pg-wrap">
      <p class="pg-footer-name">${esc(t.footerName)} <span lang="${t.footerAltLang}">${esc(t.footerAlt)}</span></p>
      <p>${esc(t.address)} · ${bothNumbers(t)}</p>
      <nav class="pg-footer-links" aria-label="${esc(t.allPages)}">
        <a href="/">${esc(t.home)}</a>
        ${pageList(lang).map(({ slug: s, label }) => `<a href="${path(lang, s)}">${esc(label)}</a>`).join('\n        ')}
        <a href="/#faq">${esc(t.faqLink)}</a>
      </nav>
      ${toggle(' pg-lang-footer')}
      <p class="pg-small">${esc(t.copyright)}</p>
    </div>
  </footer>

  <div class="pg-callbar">
    <a href="tel:${site.phone}">${esc(t.call(site.phoneLabel))}</a>
    <a href="${esc(site.directions)}" target="_blank" rel="noopener">${esc(t.directionsShort)}</a>
  </div>
</body>
</html>
`;
}

function pageSchema({ lang, slug, title, description, h1, crumb, faqs, extra = [], specialtyValue }) {
  const t = L[lang];
  const url = `${D}${path(lang, slug)}`;
  const crumbs = [{ name: t.home, item: `${D}/` }];
  if (crumb) crumbs.push({ name: t.servicesCrumb, item: `${D}/#services` });
  crumbs.push({ name: crumb || h1, item: url });
  const list = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: t.inLanguage,
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
      inLanguage: t.inLanguage,
      mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return list;
}

const written = [];
function emit(lang, slug, html) {
  writeFileSync(join(out, lang === 'te' ? join('te', `${slug}.html`) : `${slug}.html`), html);
  written.push({ lang, slug });
}

for (const lang of ['en', 'te']) {
  const t = L[lang];

  // ---------- Department pages ----------
  for (const d of departments) {
    const words = lang === 'te' ? d.te : d;
    const p = words.page;
    const isFacilities = d.slug === 'hospital-facilities-tanuku';
    const body = `
        <section class="pg-section pg-intro">
          ${p.intro.map((para) => `<p>${esc(para)}</p>`).join('\n          ')}
        </section>
        <section class="pg-section" aria-labelledby="list-title">
          <h2 id="list-title">${esc(t.listTitle(words.title, isFacilities))}</h2>
          <ul class="pg-checks">
            ${words.items.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </section>${trustBlock(t)}${visitBlock(t)}${faqBlock(t, p.faqs)}`;
    emit(lang, d.slug, layout({
      lang, slug: d.slug, title: p.title, description: p.description, h1: p.h1, crumb: words.title,
      photo: pagePhoto[d.slug] ?? 'reception', body,
      schema: pageSchema({ lang, slug: d.slug, title: p.title, description: p.description, h1: p.h1, crumb: words.title, faqs: p.faqs, specialtyValue: specialty[d.slug] }),
    }));
  }

  // ---------- Emergency page (main target: "emergency hospital in Tanuku") ----------
  {
    const slug = 'emergency-hospital-tanuku';
    const E = lang === 'te' ? {
      title: 'తణుకులో 24/7 అత్యవసర హాస్పిటల్ | శ్రీ బాలాజీ హాస్పిటల్, సజ్జాపురం',
      description: `తణుకులో ఐసీయూ, వెంటిలేటర్, బైపాప్ మరియు వెంటిలేటర్ అంబులెన్స్‌తో 24/7 అత్యవసర హాస్పిటల్. ప్రమాదాలు, పాముకాటు, విషప్రయోగం, కాలిన గాయాలు, స్ట్రోక్ మరియు గుండె సంబంధిత అత్యవసర పరిస్థితులు. కాల్ చేయండి: ${site.phoneLabel} లేదా ${site.phone2Label}.`,
      h1: 'తణుకులో 24/7 అత్యవసర హాస్పిటల్',
      intro: [
        'సజ్జాపురం, తణుకులోని శ్రీ బాలాజీ హాస్పిటల్‌లో అత్యవసర సేవలు <strong>రోజుకు 24 గంటలూ, వారంలో 7 రోజులూ</strong> అందుబాటులో ఉంటాయి. అత్యవసర చికిత్స మరియు క్రిటికల్ కేర్‌కు 25 సంవత్సరాల అనుభవం ఉన్న క్రిటికల్ కేర్ స్పెషలిస్ట్ డా. డి. బిల్లీ గ్రాహం, M.B.B.S., M.D. నేతృత్వం వహిస్తారు; తీవ్రమైన, క్లిష్టమైన కేసులను స్వయంగా చూస్తారు.',
        'హాస్పిటల్‌లో వెంటిలేటర్, బైపాప్ మరియు సీపాప్ సపోర్ట్‌తో ఐసీయూ, మాడ్యులర్ ఆపరేషన్ థియేటర్ మరియు వెంటిలేటర్ అంబులెన్స్ ఉన్నాయి. అందువల్ల పేషెంట్‌ను స్థిరపరచడం, పర్యవేక్షించడం, అవసరమైతే ఆపరేషన్ చేయడం అన్నీ ఒకే చోట జరుగుతాయి.',
      ],
      stepsTitle: 'అత్యవసర పరిస్థితిలో',
      steps: [
        `<strong>వచ్చే దారిలోనే కాల్ చేయండి:</strong> ${bothNumbers(t)} – మీరు వచ్చేసరికి బృందం సిద్ధంగా ఉంటుంది.`,
        '<strong>అంబులెన్స్ కావాలా?</strong> ఇవే నంబర్లలో వెంటిలేటర్ అంబులెన్స్ అడగండి, లేదా <a href="tel:108">108</a> కు కాల్ చేయండి.',
        `<strong>నేరుగా రండి:</strong> ${esc(t.address)}. <a href="${esc(site.directions)}" target="_blank" rel="noopener">Google Maps లో దారి</a>.`,
      ],
      listTitle: 'పగలు, రాత్రి చికిత్స అందించే అత్యవసర పరిస్థితులు',
      list: ['రోడ్డు ప్రమాదాలు మరియు గాయాలు', 'తలకు తగిలిన గాయాలు', 'పాముకాటు', 'విషప్రయోగం', 'కాలిన గాయాలు', 'గుండె సంబంధిత అత్యవసర పరిస్థితులు', 'స్ట్రోక్ మరియు అకస్మాత్తుగా వచ్చే పక్షవాతం', 'మూర్ఛ (ఫిట్స్)', 'శ్వాస తీసుకోవడంలో ఇబ్బంది మరియు ఆస్తమా అటాక్‌లు', 'తీవ్రమైన జ్వరం'],
      readyTitle: 'మీరు వచ్చేసరికి సిద్ధంగా ఉండేవి',
      ready: ['ఇంటెన్సివ్ కేర్ యూనిట్ (ఐసీయూ)', 'వెంటిలేటర్, బైపాప్ మరియు సీపాప్ సపోర్ట్', 'వెంటిలేటర్ అంబులెన్స్', 'కార్డియాక్ మరియు మల్టీపారామీటర్ మానిటర్లు', 'డీఫిబ్రిలేటర్', 'సెంట్రల్ ఆక్సిజన్ సరఫరా', 'మాడ్యులర్ ఆపరేషన్ థియేటర్', 'అందుబాటులో క్రిటికల్ కేర్ స్పెషలిస్ట్'],
      seeAlso: `మరింత సమాచారం: <a href="${path(lang, 'icu-critical-care-tanuku')}">ఐసీయూ మరియు క్రిటికల్ కేర్</a>, <a href="${path(lang, 'neurosurgery-tanuku')}">తల గాయాలకు న్యూరోసర్జరీ</a>, <a href="${path(lang, 'neurology-tanuku')}">స్ట్రోక్ మరియు ఫిట్స్‌కు న్యూరాలజీ</a>, <a href="${path(lang, 'general-medicine-tanuku')}">పాముకాటు మరియు విషప్రయోగానికి జనరల్ మెడిసిన్</a>.`,
      faqs: [
        { q: 'తణుకులో 24/7 అత్యవసర సేవలు అందించే హాస్పిటల్ ఏది?', a: `సజ్జాపురం, తణుకులోని శ్రీ బాలాజీ హాస్పిటల్‌లో ప్రమాదాలు, పాముకాటు, విషప్రయోగం, గుండె సంబంధిత అత్యవసర పరిస్థితులతో సహా అన్ని అత్యవసర కేసులకు రోజుకు 24 గంటలూ, ప్రతిరోజూ ఐసీయూ, వెంటిలేటర్ సదుపాయంతో చికిత్స అందుతుంది. వచ్చే దారిలోనే ${site.phoneLabel} లేదా ${site.phone2Label} కు కాల్ చేయండి.` },
        { q: 'అత్యవసర విభాగం రాత్రి, ఆదివారాల్లో తెరిచి ఉంటుందా?', a: 'అవును. అత్యవసర సేవలు రాత్రులు, ఆదివారాలు, సెలవు రోజులతో సహా రోజుకు 24 గంటలూ, వారంలో 7 రోజులూ అందుబాటులో ఉంటాయి.' },
        { q: 'వెంటిలేటర్ అంబులెన్స్ ఉందా?', a: `అవును. వెంటిలేటర్ అంబులెన్స్ అందుబాటులో ఉంది. ${site.phoneLabel} లేదా ${site.phone2Label} కు కాల్ చేయండి. ప్రభుత్వ అంబులెన్స్ కోసం 108 కు కాల్ చేయండి.` },
        { q: 'అత్యవసర చికిత్సకు క్యాష్‌లెస్ ఇన్సూరెన్స్ అంగీకరిస్తారా?', a: 'అన్ని హెల్త్ ఇన్సూరెన్స్ కేసులను చూస్తాం, క్యాష్‌లెస్ చికిత్స అందుబాటులో ఉంది. పాలసీ వివరాలు వెంట తీసుకురండి, లేదా కాల్ చేస్తే మా డెస్క్ మీ కవరేజీని నిర్ధారిస్తుంది.' },
      ],
      serviceName: 'శ్రీ బాలాజీ హాస్పిటల్ – 24/7 అత్యవసర సేవలు',
    } : {
      title: '24/7 Emergency Hospital in Tanuku | Sri Balaji Hospital, Sajjapuram',
      description: `24/7 emergency hospital in Tanuku with ICU, ventilator, BiPAP and a ventilator ambulance. Accidents, snakebite, poisoning, burns, stroke and cardiac emergencies. Call ${site.phoneLabel} or ${site.phone2Label}.`,
      h1: '24/7 Emergency Hospital in Tanuku',
      intro: [
        `Sri Balaji Hospital in Sajjapuram, Tanuku is open for emergencies <strong>24 hours a day, 7 days a week</strong>. Emergency and critical care is led by ${esc(site.doctor.name)}, ${esc(site.doctor.degree)}, a ${esc(site.doctor.specialty)} with ${esc(site.doctor.experience)} of experience, who personally attends serious and critical cases.`,
        'The hospital has an ICU with ventilator, BiPAP and CPAP support, a modular operation theatre and a ventilator ambulance, so patients can be stabilised, monitored and operated on in one place.',
      ],
      stepsTitle: 'In an emergency',
      steps: [
        `<strong>Call on the way:</strong> ${bothNumbers(t)}, so the team is ready when you arrive.`,
        '<strong>Need an ambulance?</strong> Ask for the ventilator ambulance on the same numbers, or call <a href="tel:108">108</a>.',
        `<strong>Come straight in:</strong> ${esc(site.address.full)}. <a href="${esc(site.directions)}" target="_blank" rel="noopener">Directions in Google Maps</a>.`,
      ],
      listTitle: 'Emergencies attended day and night',
      list: ['Road accidents and injuries', 'Head injuries', 'Snakebite', 'Poisoning', 'Burns', 'Cardiac emergencies', 'Stroke and sudden paralysis', 'Seizures (fits)', 'Breathing difficulty and asthma attacks', 'High fever'],
      readyTitle: 'Ready when you arrive',
      ready: ['Intensive Care Unit (ICU)', 'Ventilator, BiPAP and CPAP support', 'Ventilator ambulance', 'Cardiac and multiparameter monitors', 'Defibrillator', 'Central oxygen supply', 'Modular operation theatre', 'Critical Care Specialist on call'],
      seeAlso: `See <a href="/icu-critical-care-tanuku">ICU and critical care</a>, <a href="/neurosurgery-tanuku">neurosurgery for head injuries</a>, <a href="/neurology-tanuku">neurology for stroke and fits</a> and <a href="/general-medicine-tanuku">general medicine for snakebite and poisoning</a>.`,
      faqs: [
        { q: 'Which hospital in Tanuku is open 24/7 for emergencies?', a: `Sri Balaji Hospital in Sajjapuram, Tanuku attends emergencies 24 hours a day, every day, including accidents, snakebite, poisoning and cardiac emergencies, with an ICU and ventilator. Call ${site.phoneLabel} or ${site.phone2Label} on the way.` },
        { q: 'Is the emergency open at night and on Sundays?', a: 'Yes. Emergency care is available 24 hours a day, 7 days a week, including nights, Sundays and holidays.' },
        { q: 'Do you have a ventilator ambulance?', a: `Yes. A ventilator ambulance is available. Call ${site.phoneLabel} or ${site.phone2Label}. For a government ambulance, call 108.` },
        { q: 'Is cashless insurance accepted for emergencies?', a: 'We handle all health insurance cases and cashless treatment is available. Bring the policy details with you, or call and the desk will confirm your coverage.' },
      ],
      serviceName: 'Sri Balaji Hospital – 24/7 Emergency',
    };
    const body = `
        <section class="pg-section pg-intro">
          ${E.intro.map((para) => `<p>${para}</p>`).join('\n          ')}
        </section>
        <section class="pg-section pg-steps" aria-labelledby="steps-title">
          <h2 id="steps-title">${esc(E.stepsTitle)}</h2>
          <ol>
            ${E.steps.map((step) => `<li>${step}</li>`).join('\n            ')}
          </ol>
        </section>
        <section class="pg-section" aria-labelledby="list-title">
          <h2 id="list-title">${esc(E.listTitle)}</h2>
          <ul class="pg-checks">
            ${E.list.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </section>
        <section class="pg-section" aria-labelledby="ready-title">
          <h2 id="ready-title">${esc(E.readyTitle)}</h2>
          <ul class="pg-checks">
            ${E.ready.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
          <p>${E.seeAlso}</p>
        </section>${trustBlock(t)}${visitBlock(t)}${faqBlock(t, E.faqs)}`;
    const emergencyService = {
      '@context': 'https://schema.org',
      '@type': 'EmergencyService',
      '@id': `${D}${path(lang, slug)}#emergency`,
      name: E.serviceName,
      url: `${D}${path(lang, slug)}`,
      telephone: '+91-98857-71197',
      parentOrganization: hospitalRef,
      address: postalAddress,
      geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
      openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
      areaServed: [{ '@type': 'City', name: 'Tanuku' }, { '@type': 'AdministrativeArea', name: 'West Godavari' }],
    };
    emit(lang, slug, layout({
      lang, slug, title: E.title, description: E.description, h1: E.h1, crumb: null, photo: 'icu', body,
      schema: pageSchema({ lang, slug, title: E.title, description: E.description, h1: E.h1, faqs: E.faqs, extra: [emergencyService], specialtyValue: 'Emergency' }),
    }));
  }

  // ---------- Doctor page ----------
  {
    const slug = 'dr-d-billy-graham';
    const doc = site.doctor;
    const areasEn = ['Emergency care', 'Critical care & ICU', 'General medicine', 'Snakebite & poisoning', 'Cardiac care', 'Diabetes & blood pressure'];
    const P = lang === 'te' ? {
      title: 'డా. డి. బిల్లీ గ్రాహం, M.D. | తణుకులో క్రిటికల్ కేర్ స్పెషలిస్ట్',
      description: `శ్రీ బాలాజీ హాస్పిటల్, సజ్జాపురం, తణుకులో క్రిటికల్ కేర్ స్పెషలిస్ట్ డా. డి. బిల్లీ గ్రాహం, M.B.B.S., M.D. 25 సంవత్సరాల అనుభవం. ${doc.registration}. కన్సల్టేషన్: ఉదయం 10:00 – మధ్యాహ్నం 2:00, సాయంత్రం 6:00 – రాత్రి 8:30.`,
      h1: 'డా. డి. బిల్లీ గ్రాహం, M.B.B.S., M.D.',
      eyebrow: 'క్రిటికల్ కేర్ స్పెషలిస్ట్',
      intro: 'డా. డి. బిల్లీ గ్రాహం, M.B.B.S., M.D. సజ్జాపురం, తణుకులోని శ్రీ బాలాజీ హాస్పిటల్‌లో అత్యవసర చికిత్స, క్రిటికల్ కేర్ మరియు జనరల్ మెడిసిన్ విభాగాలకు నేతృత్వం వహిస్తూ, తీవ్రమైన మరియు క్లిష్టమైన కేసులను స్వయంగా చూస్తారు.',
      facts: [['అనుభవం', '25 సంవత్సరాలు'], ['రిజిస్ట్రేషన్', doc.registration], ['కన్సల్టేషన్', 'ఉదయం 10:00 – మధ్యాహ్నం 2:00, సాయంత్రం 6:00 – రాత్రి 8:30'], ['అత్యవసర సేవలు', '24 గంటలు, 7 రోజులు']],
      areasTitle: 'చికిత్సా విభాగాలు',
      areas: areasEn.map((a) => uiTe[a] ?? a),
      imgAlt: 'కన్సల్టేషన్ డెస్క్ వద్ద డా. డి. బిల్లీ గ్రాహం',
      faqs: [
        { q: 'డా. డి. బిల్లీ గ్రాహం కన్సల్టేషన్ సమయాలు ఏమిటి?', a: 'కన్సల్టేషన్ సమయాలు: ఉదయం 10:00 – మధ్యాహ్నం 2:00, సాయంత్రం 6:00 – రాత్రి 8:30. అత్యవసర కేసులను ఎల్లప్పుడూ చూస్తారు.' },
        { q: 'డా. డి. బిల్లీ గ్రాహం వద్ద అపాయింట్‌మెంట్ ఎలా బుక్ చేసుకోవాలి?', a: `అపాయింట్‌మెంట్లు మరియు డాక్టర్ అందుబాటు గురించి తెలుసుకోవడానికి ${site.phoneLabel} లేదా ${site.phone2Label} కు కాల్ చేయండి.` },
      ],
    } : {
      title: `${doc.name}, M.D. | ${doc.specialty} in Tanuku`,
      description: `${doc.name}, ${doc.degree}, ${doc.specialty} at Sri Balaji Hospital, Sajjapuram, Tanuku. ${doc.experience} of experience. ${doc.registration}. Consultation ${site.hours.consultation}.`,
      h1: `${doc.name}, ${doc.degree}`,
      eyebrow: doc.specialty,
      intro: `${doc.name}, ${doc.degree}, leads emergency, critical care and general medicine at Sri Balaji Hospital in Sajjapuram, Tanuku, and personally attends serious and critical cases.`,
      facts: [['Experience', doc.experience], ['Registration', doc.registration], ['Consultation', site.hours.consultation], ['Emergency', '24 hours, 7 days']],
      areasTitle: 'Areas of care',
      areas: areasEn,
      imgAlt: `${doc.name} at the consultation desk`,
      faqs: [
        { q: `What are ${doc.name}'s consultation hours?`, a: `Consultation hours are ${site.hours.consultation}. Emergency cases are attended at all times.` },
        { q: `How do I book with ${doc.name}?`, a: `Call ${site.phoneLabel} or ${site.phone2Label} to ask about appointments and doctor availability.` },
      ],
    };
    const body = `
        <section class="pg-section pg-doctor">
          <img src="/assets/dr-billygraham-deepati.webp" alt="${esc(P.imgAlt)}" width="864" height="1080" loading="lazy" decoding="async" />
          <div>
            <p class="pg-eyebrow">${esc(P.eyebrow)}</p>
            <p>${esc(P.intro)}</p>
            <dl class="pg-hours">
              ${P.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n              ')}
            </dl>
          </div>
        </section>
        <section class="pg-section" aria-labelledby="list-title">
          <h2 id="list-title">${esc(P.areasTitle)}</h2>
          <ul class="pg-checks">
            ${P.areas.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </section>${visitBlock(t)}${faqBlock(t, P.faqs)}`;
    const physician = {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      '@id': `${D}/dr-d-billy-graham#physician`,
      name: doc.name,
      honorificSuffix: doc.degree,
      description: `${doc.specialty}, ${doc.registration}, ${doc.experience} of experience`,
      image: `${D}/assets/dr-billygraham-deepati.webp`,
      url: `${D}/dr-d-billy-graham`,
      telephone: '+91-98857-71197',
      medicalSpecialty: 'https://schema.org/Emergency',
      hospitalAffiliation: hospitalRef,
      address: postalAddress,
    };
    emit(lang, slug, layout({
      lang, slug, title: P.title, description: P.description, h1: P.h1, crumb: null, photo: 'consult', body,
      schema: pageSchema({ lang, slug, title: P.title, description: P.description, h1: P.h1, faqs: P.faqs, extra: [physician] }),
    }));
  }
}

// ---------- Styles shared by the pages ----------
writeFileSync(join(out, 'assets', 'pages', 'pages.css'), readFileSync(join(root, 'scripts', 'pages.css'), 'utf8'));

// ---------- Sitemap: home, then every page with its English and Telugu versions linked ----------
const slugs = [...new Set(written.map((w) => w.slug))];
const urlEntry = (lang, slug) => `  <url>
    <loc>${D}${path(lang, slug)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${slug === 'emergency-hospital-tanuku' ? '0.9' : '0.8'}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${D}${path('en', slug)}" />
    <xhtml:link rel="alternate" hreflang="te" href="${D}${path('te', slug)}" />
  </url>`;
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${D}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${slugs.flatMap((slug) => [urlEntry('en', slug), urlEntry('te', slug)]).join('\n')}
</urlset>
`);

console.log(`build-pages: wrote ${written.length} pages (${slugs.length} in English and Telugu) and sitemap.xml (${1 + written.length} URLs)`);
