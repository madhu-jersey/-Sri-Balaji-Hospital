// Phone numbers come from src/data/site.json, the one place for the hospital's details.
// The mobile 98857 71197 is the main number: shown first, and every "Call" button dials it.
// The landline 08819 221778 is shown second wherever both numbers appear.
import site from './site.json';

export const phone = site.phone;
export const phoneLabel = site.phoneLabel;
export const phone2 = site.phone2;
export const phone2Label = site.phone2Label;
