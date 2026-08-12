import type { LegalContent } from "../legalContent";

type Props = {
  content: LegalContent | null;
  heading: string;
};

export function LegalResponsibleParty({ content, heading }: Props) {
  const name = content?.responsible_name?.trim();
  const address = content?.responsible_address?.trim();
  const email = content?.responsible_email?.trim();

  if (!name && !address && !email) return null;

  return (
    <section className="legal-responsible-party">
      <h2>{heading}</h2>
      <address>
        {name && <>{name}<br /></>}
        {address && <span className="legal-address">{address}</span>}
        {email && <><br /><a href={`mailto:${email}`}>{email}</a></>}
      </address>
    </section>
  );
}
