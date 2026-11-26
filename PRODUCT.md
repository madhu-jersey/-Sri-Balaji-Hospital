# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two equal groups (confirmed by the owner):
- Local patients in and around Sajjapuram / Tanuku, mostly on phones, who want the phone number, today's timings and directions fast.
- Families comparing hospitals, who want to trust the doctor and read reviews before calling.

## Product Purpose

Public website for Sri Balaji Hospital, Sajjapuram, Andhra Pradesh 534211. Success is a visitor calling the hospital or getting directions; both actions are primary (confirmed).

## Positioning

A doctor-led local hospital: Dr. D. Billy Graham, M.B.B.S., M.D., Critical Care Specialist (APMC No. 42113). Tagline: "We care for you". Offers comprehensive medical care, critical care, emergency services and surgical care. Patient reviews mention reasonable rates, no unnecessary tests or medicines, and a doctor who attends serious cases.

## Operating Context

Visitors read in English with Telugu alongside (the building signboard is Telugu). Most visits are on mobile.

## Capabilities and Constraints

- Phone: main number 98857 71197 (mobile, shown first; every Call button dials it), then 08819 221778 (landline, shown second). Owner request, Nov 2026.
- Address: Sajjapuram, Andhra Pradesh 534211 (owner-corrected; do not add street names or landmarks).
- Hospital hours: Mon–Sat 9:30 AM – 8:30 PM, Sun 10:00 AM – 8:00 PM. Doctor consultation 10 AM – 2 PM and 6 PM – 8:30 PM (brochure).
- Services (hospital brochure, supplied by the owner Nov 2026, with the owner's later changes): General Medicine & Emergency Care, General Surgery (thyroid, lipoma, breast lump, hysterectomy, vaginal hysterectomy, ovarian tumours/cysts, fibroids, diabetic foot ulcer/amputation, skin grafting added), Neurosurgery, Neurology (stroke and paralysis, seizures, meningitis, headache and migraine, memory loss, Parkinson's disease), Plastic & Reconstructive Surgery, Laparoscopic Surgery (Lap Chole, total laparoscopic hysterectomy), Critical Care (ventilator, BiPAP and CPAP support, ventilator ambulance), and General Facilities (lift, generator backup, continuous RO drinking water, spacious parking, single and AC rooms, ambulance, wheelchair, stretcher). Each service is listed once per section (see src/components/ServicesSection.tsx).
- Highlights (owner-confirmed Nov 2026): established 2006 (20 years); the doctor has 25 years of experience.
- Equipment and facilities (brochure): modular operation theatre (owner, Nov 2026), ICU, ventilator, central oxygen, cardiac and multiparameter monitors, defibrillator, infusion and syringe pumps, pulse oximeter, nebulizer, general ward. Inpatient care subject to available facilities.
- Emergency care 24 hours, 7 days, on 98857 71197 or 08819 221778 (confirmed by the owner, Nov 2026). Outpatient (OP) hours are the hospital hours above.
- Insurance: all health insurance cases handled and cashless treatment available (confirmed by the owner, Nov 2026). No specific insurers named.
- Not confirmed, so never claimed: lab, pharmacy, Aarogyasri, named insurance partners.

## Brand Commitments

- Keep the blue colour family (owner decision, Nov 2026); layout may change.
- Heart logo with cross: public/assets/sri-balaji-hospital-logo.png.
- Telugu name: శ్రీ బాలాజీ హాస్పిటల్.

## Evidence on Hand

- Building photo, doctor photo, logo: artifacts/sri-sai-hospital/public/assets/.
- Google rating 3.8 from 38 reviews; three transcribed 5-star reviews (Raaki Rakesh, Sai Kiran, Harsh Shekhar), no dates.
- No interior photos yet (reception, consultation, waiting, lab are placeholders). Do not fabricate.

## Product Principles

- Call and directions are never more than one tap away.
- Say only what is confirmed; mark the rest as "call to confirm".
- Show the doctor and real reviews as the trust, not adjectives.

- Domain: https://sribalajihospitaltanuku.com (Nov 2026). Service pages (one per department, plus /emergency-hospital-tanuku and /dr-d-billy-graham) are generated at build time by artifacts/sri-sai-hospital/scripts/build-pages.mjs from src/data/services.json and src/data/site.json, together with sitemap.xml.
