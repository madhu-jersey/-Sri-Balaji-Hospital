import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Activity, ArrowRight, Bandage, Brain, BrainCircuit, Building2, Check, ChevronDown, Microscope, PhoneCall, Scissors, Stethoscope, type LucideIcon } from 'lucide-react';
import servicesData from '../data/services.json';
import { pageHref, useLang, type Lang } from '../i18n';

// Departments and services live in src/data/services.json, shared with the service pages (scripts/build-pages.mjs).
const icons: Record<string, LucideIcon> = {
  'general-medicine-tanuku': Stethoscope,
  'general-surgery-tanuku': Scissors,
  'neurosurgery-tanuku': Brain,
  'neurology-tanuku': BrainCircuit,
  'plastic-surgery-tanuku': Bandage,
  'laparoscopic-surgery-tanuku': Microscope,
  'icu-critical-care-tanuku': Activity,
  'hospital-facilities-tanuku': Building2,
};
// Each department in the chosen language; Telugu comes from its "te" block in services.json.
function departmentsIn(lang: Lang) {
  return servicesData.departments.map((department) => {
    const words = lang === 'te' ? department.te : department;
    return {
      slug: department.slug,
      title: words.title,
      short: words.short,
      text: words.text,
      items: words.items,
      unit: (department as { unit?: string }).unit === 'facilities' ? '{n} facilities' : '{n} services',
      icon: icons[department.slug] ?? Stethoscope,
      href: pageHref(lang, department.slug),
    };
  });
}


import { phone, phoneLabel } from '../data/contact';

// Department tabs on the left, the chosen department's full list on the right.
// Keeps every department the same footprint and shows all sub-services without tall cards.
export function ServicesSection() {
  const { t, lang } = useLang();
  const departments = departmentsIn(lang);
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

  const panelBody = (item: (typeof departments)[number], PanelIcon: LucideIcon) => (
    <>
      <div className="svc-panel-head">
        <span className="svc-panel-icon"><PanelIcon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
        <div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      </div>
      <ul className="svc-list">
        {item.items.map((service, index) => (
          <li key={index} style={{ '--item-index': index } as React.CSSProperties}>
            <span className="svc-check" aria-hidden="true"><Check size={12} strokeWidth={2.6} /></span>
            {service}
          </li>
        ))}
      </ul>
      <div className="svc-panel-foot">
        <a className="svc-call" href={`tel:${phone}`}>
          <PhoneCall size={17} aria-hidden="true" /> {t('Call {n}', { n: phoneLabel })}
        </a>
        <a className="svc-more" href={item.href}>{t('About {name} in Tanuku', { name: lang === 'te' ? item.short : item.short.toLowerCase() })} <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </>
  );

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
          <h2 id="services-heading">{t('Our')} <em>{t('services')}</em></h2>
          <p>{t('Comprehensive medical care, critical care, emergency services, surgical care and patient facilities in Sajjapuram, Tanuku.')}</p>
        </div>

        <div className="svc reveal">
          <div className="svc-tabs" role="tablist" aria-label={t('Departments')} aria-orientation="vertical">
            {departments.map(({ slug, title, short, icon: TabIcon, items, unit }, index) => (
              <button
                key={slug}
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
                  <span className="svc-tab-count">{t(unit, { n: items.length })}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Invisible copies of every department sit in the same grid cell as the visible panel, so the box is always
              as tall as the longest list in the current language and screen width: switching tabs never jumps. */}
          <div className="svc-panel-stack">
            {departments.map((item) => (
              <div className="svc-panel svc-panel-ghost" aria-hidden="true" inert key={`ghost-${item.slug}`}>
                {panelBody(item, item.icon)}
              </div>
            ))}
            <div className="svc-panel" role="tabpanel" id="svc-panel" aria-labelledby={`svc-tab-${active + 1}`} key={active}>
              {panelBody(department, Icon)}
            </div>
          </div>
        </div>

        {/* Phones: one tidy card per department; tap to open its full list. Shown instead of the tabs below 760px. */}
        <div className="svc-acc">
          {departments.map(({ slug, title, short, text, icon: ItemIcon, items, href, unit }, index) => {
            const open = mobileOpen.has(index);
            // className stays constant: the scroll-reveal observer adds is-visible to the DOM, and a re-render must not wipe it. Open state lives in data-open.
            return (
              <article className="svc-acc-item reveal" data-open={open} key={slug} style={{ '--motion-delay': `${index * 50}ms` } as React.CSSProperties}>
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
                      <span className="svc-acc-count">{t(unit, { n: items.length })}</span>
                    </span>
                    <span className="svc-acc-chevron" aria-hidden="true"><ChevronDown size={18} strokeWidth={2.2} /></span>
                  </button>
                </h3>
                <div className="svc-acc-panel" id={`svc-acc-panel-${index + 1}`} role="region" aria-labelledby={`svc-acc-head-${index + 1}`} inert={!open}>
                  <div className="svc-acc-inner">
                    <p className="svc-acc-desc">{text}</p>
                    <ul className="svc-acc-list">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex}><span className="svc-check" aria-hidden="true"><Check size={11} strokeWidth={2.6} /></span>{item}</li>
                      ))}
                    </ul>
                    <a className="svc-acc-call" href={`tel:${phone}`}><PhoneCall size={16} aria-hidden="true" /> {t('Call {n}', { n: phoneLabel })}</a>
                    <a className="svc-acc-more" href={href}>{t('About {name} in Tanuku', { name: lang === 'te' ? short : short.toLowerCase() })} <ArrowRight size={15} aria-hidden="true" /></a>
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
