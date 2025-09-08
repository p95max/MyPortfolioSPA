export const Home = () => (
  <div
    style={{
      maxWidth: 800,
      margin: '40px auto',
      padding: 30,
      borderRadius: 12,
      backgroundColor: '#fff',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
      textAlign: 'center',
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
      Welcome to My Single Page Application Portfolio
    </h1>
    <p
      style={{
        fontSize: '1.2rem',
        lineHeight: 1.6,
        marginBottom: 24,
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      Hi! I’m a full-stack developer passionate about building modern web applications. Explore my projects and feel free to get in touch.
    </p>
  </div>
);