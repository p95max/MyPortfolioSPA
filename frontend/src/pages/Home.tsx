import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import aboutText from '../components/aboutText';

export const Home = () => {
  useEffect(() => {
    document.title = 'My SPA Portfolio';
  }, []);

  const [lang, setLang] = useState('DE'); // 'DE' или 'EN'

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '40px auto',
        padding: 30,
        borderRadius: 12,
        backgroundColor: 'transparent',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <h1
        style={{
          fontSize: '2.8rem',
          marginBottom: 16,
          color: '#9fbce3',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        Welcome <br /> to My SPA (Single Page Application) Portfolio
      </h1>
      <div
        style={{
          fontSize: '1.1rem',
          lineHeight: 1.6,
          marginBottom: 24,
          color: '#0070f3',
          textAlign: 'left',
          whiteSpace: 'normal',
        }}
      >
        <ReactMarkdown>{aboutText}</ReactMarkdown>
      </div>

        <h1 style={{color: '#0070f3'}}>My resumes:</h1>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setLang('DE')}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            backgroundColor: lang === 'DE' ? '#0070f3' : '#eee',
            color: lang === 'DE' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Deutsch
        </button>
        <button
          onClick={() => setLang('EN')}
          style={{
            padding: '10px 20px',
            backgroundColor: lang === 'EN' ? '#0070f3' : '#eee',
            color: lang === 'EN' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          English
        </button>
      </div>

      <iframe
        src={lang === 'DE' ? '/resumeDE.pdf' : '/resumeENG.pdf'}
        width="100%"
        height="800px"
        title={`Resume ${lang}`}
        style={{ border: '1px solid #ccc', borderRadius: 8 }}
      />
    </div>
  );
};