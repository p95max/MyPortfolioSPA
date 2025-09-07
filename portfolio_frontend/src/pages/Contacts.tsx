import { useEffect, useState } from "react";
import type { Contact } from "../types/contact";
import { getContacts } from "../api/contacts";

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  useEffect(() => {
    getContacts().then(setContacts);
  }, []);

  return (
    <div>
      <h1>Contacts</h1>
      <ul>
        {contacts.map((c) => (
          <li key={c.id}>
            {c.name} ({c.email}): {c.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;
