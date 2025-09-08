import { useState } from 'react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  if (submitted)
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h2>Thank you for your message!</h2>
        <p>I will get back to you soon.</p>
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: 20,
        maxWidth: 400,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ textAlign: 'center' }}>Contact Me</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
          {error}
        </div>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: '600' }}>
        Name
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          style={{
            padding: '8px 12px',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
            marginTop: 6,
          }}
          placeholder="Your name"
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: '600' }}>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            padding: '8px 12px',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
            marginTop: 6,
          }}
          placeholder="you@example.com"
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: '600' }}>
        Message
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          style={{
            padding: '8px 12px',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
            marginTop: 6,
            resize: 'vertical',
          }}
          placeholder="Write your message here..."
        />
      </label>

      <button
        type="submit"
        style={{
          padding: '12px',
          fontSize: '1rem',
          borderRadius: 6,
          border: 'none',
          backgroundColor: '#0070f3',
          color: '#fff',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#005bb5')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0070f3')}
      >
        Send
      </button>
    </form>
  );
};