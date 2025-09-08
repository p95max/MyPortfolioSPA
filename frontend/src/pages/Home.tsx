import aboutText from '../components/aboutText';

export const Home = () => (
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
        color: '#0070f3',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      Welcome <br /> to My SPA (Single Page Application) Portfolio
    </h1>
    <pre
      style={{
        whiteSpace: 'pre-wrap',
        fontSize: '1.1rem',
        lineHeight: 1.6,
        marginBottom: 24,
        color: '#0070f3',
        textAlign: 'left',
      }}
    >
      {aboutText}
    </pre>
  </div>
);