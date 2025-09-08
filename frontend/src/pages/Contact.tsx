import { useState } from 'react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) return <p>Thank you for your message!</p>;

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, maxWidth: 400 }}>
      <h1>Contact Me</h1>
      <label>
        Name:<br />
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>
      <br /><br />
      <label>
        Email:<br />
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </label>
      <br /><br />
      <label>
        Message:<br />
        <textarea name="message" value={form.message} onChange={handleChange} required />
      </label>
      <br /><br />
      <button type="submit">Send</button>
    </form>
  );
};