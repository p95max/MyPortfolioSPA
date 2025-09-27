import { useState } from 'react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  description: string;
  fileName: string;
  previewImage?: string;
}

const certificates: Certificate[] = [
  {
    id: '1',
    title: 'Google Certificate',
    issuer: 'Google',
    description: 'Professional certification from Google demonstrating expertise in relevant technologies and best practices.',
    fileName: 'Google_certificate.pdf',
  },
  {
    id: '2',
    title: 'Starta Certificate (DE)',
    issuer: 'Starta',
    description: "German version of the backend development certificate. Topics include Python, Django, databases, microservices, API integration (OpenAI), team project and introduction to neural networks.",
    fileName: 'Starta_DE.pdf',
  },
  {
    id: '3',
    title: 'Starta Certificate (EN)',
    issuer: 'Starta',
    description: "English version of the backend development certificate. Topics include Python, Django, databases, microservices, API integration (OpenAI), team project and introduction to neural networks.",
    fileName: 'Starta_EN.pdf',
  },
];

const CertificateCard = ({ certificate }: { certificate: Certificate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    const link = document.createElement('a');
    link.href = `/${certificate.fileName}`;
    link.download = certificate.fileName;
    link.click();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleView = () => {
    window.open(`/${certificate.fileName}`, '_blank');
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#a4a0a0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            fontSize: '20px',
          }}
        >
          📜
        </div>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{certificate.title}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Issued by: <strong>{certificate.issuer}</strong>
          </p>
        </div>
      </div>

      <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '15px' }}>
        {certificate.description}
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleView}
          style={{
            padding: '8px 16px',
            backgroundColor: '#646cff',
            color: '#503f3f',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#535bf2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#646cff';
          }}
        >
          👁️ View
        </button>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#218838';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#28a745';
            }
          }}
        >
          {isLoading ? '⏳ Downloading...' : '📥 Download'}
        </button>
      </div>
    </div>
  );
};

export const Certificates = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#f6f6f6', marginBottom: '10px' }}>Certificates</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          My professional certifications and achievements
        </p>
      </div>

      <div>
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
        }}
      >
        <p style={{ color: '#666', margin: 0 }}>
          💡 <strong>Note:</strong> All certificates are available for download and viewing.
          Click "View" to open in a new tab or "Download" to save locally.
        </p>
      </div>
    </div>
  );
};