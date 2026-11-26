import { phone, phone2, phone2Label, phoneLabel } from '../data/contact';

// Both numbers in running text, main number first: "98857 71197 or 08819 221778".
export function PhoneNumbers({ testId }: { testId?: string }) {
  return (
    <>
      <a href={`tel:${phone}`} data-testid={testId}>{phoneLabel}</a> or <a href={`tel:${phone2}`}>{phone2Label}</a>
    </>
  );
}
