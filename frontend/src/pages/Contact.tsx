import { useState } from 'react';

const iconStyle = { width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' };

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
    <>
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

      <div
        style={{
          maxWidth: 400,
          margin: '20px auto',
          padding: 20,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: '#333',
          borderTop: '1px solid #ccc',
          textAlign: 'center',
        }}
      >
        <h2>Other ways to contact me</h2>
        <p>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.997.108-.775.418-1.305.76-1.605-2.665-.3-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.045.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.92.43.37.823 1.1.823 2.22 0 1.606-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <a href="https://github.com/p95max" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
            github.com/p95max
          </a>
        </p>
        <p>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.07-.93-1.5-1.5-1.5s-1.5.43-1.5 1.5v4.5h-3v-9h3v1.5c.43-.79 1.5-1.5 2.5-1.5 2.07 0 3.5 1.5 3.5 4.5v4.5z" />
          </svg>
          <a href="https://linkedin.com/in/p95max" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
            linkedin.com/in/p95max/
          </a>
        </p>
        <p>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12.713l11.985-7.713v13.5c0 1.104-.896 2-2 2h-20c-1.104 0-2-.896-2-2v-13.5l11.985 7.713zm0-2.426l-12-7.713h24l-12 7.713z" />
          </svg>
          <a href="mailto:m.petrykin@gmx.de" style={{ color: '#0070f3' }}>
            m.petrykin@gmx.de
          </a>
        </p>
        <p>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm3.5 14.5h-7v-1h7v1zm0-3h-7v-1h7v1zm0-3h-7v-1h7v1z" />
          </svg>
          <a href="https://t.me/max_p95" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
            @max_p95
          </a>
        </p>
      </div>
    </>
  );
};