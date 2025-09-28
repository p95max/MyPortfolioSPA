import { useState } from 'react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  description: string;
  fileName: string;
  type: 'certificate' | 'recommendation';
  previewImage?: string;
}

const documents: Certificate[] = [
  {
    id: '1',
    title: 'Crash Course on Python',
    issuer: 'Google / Coursera',
    description: 'An online non-credit course authorized by Google and offered through Coursera.',
    fileName: 'Google_certificate.pdf',
    type: 'certificate',
  },
  {
    id: '2',
    title: 'Starta Certificate (DE)',
    issuer: 'Starta',
    description: 'German version of the backend development certificate. Topics include Python, Django, databases, microservices, API integration (OpenAI), team project and introduction to neural networks.',
    fileName: 'Starta_DE.pdf',
    type: 'certificate',
  },
  {
    id: '3',
    title: 'Starta Certificate (EN)',
    issuer: 'Starta',
    description: 'English version of the backend development certificate.',
    fileName: 'Starta_EN.pdf',
    type: 'certificate',
  },
  {
    id: '4',
    title: 'Starta Recommendation',
    issuer: 'Starta',
    description: 'German version of the recommendation letter from Starta Institute',
    fileName: 'ref_brief.pdf',
    type: 'recommendation',
  },
];

const DocumentCard = ({ doc }: { doc: Certificate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    const link = window.document.createElement('a'); // теперь точно глобальный document
    link.href = `/${doc.fileName}`;
    link.download = doc.fileName;
    link.click();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleView = () => {
    window.open(`/${doc.fileName}`, '_blank');
  };

  const getIcon = () => {
    return doc.type === 'certificate' ? '📜' : '📋';
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
          {getIcon()}
        </div>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{doc.title}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {doc.type === 'certificate' ? 'Issued by:' : 'From:'} <strong>{doc.issuer}</strong>
          </p>
        </div>
      </div>

      <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '15px' }}>
        {doc.description}
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleView}
          style={{
            padding: '8px 16px',
            backgroundColor: '#646cff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s ease',
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
          }}
        >
          {isLoading ? '⏳ Downloading...' : '📥 Download'}
        </button>
      </div>
    </div>
  );
};

export const Certificates = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'recommendations'>('certificates');

  const certificates = documents.filter((d) => d.type === 'certificate');
  const recommendations = documents.filter((d) => d.type === 'recommendation');

  const currentDocs = activeTab === 'certificates' ? certificates : recommendations;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#f6f6f6', marginBottom: '10px' }}>Credentials</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          My professional certifications and recommendations
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('certificates')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderBottom: activeTab === 'certificates' ? '3px solid #646cff' : '3px solid transparent',
            color: activeTab === 'certificates' ? '#646cff' : '#666',
            fontWeight: activeTab === 'certificates' ? 'bold' : 'normal',
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          📜 Certificates ({certificates.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderBottom: activeTab === 'recommendations' ? '3px solid #646cff' : '3px solid transparent',
            color: activeTab === 'recommendations' ? '#646cff' : '#666',
            fontWeight: activeTab === 'recommendations' ? 'bold' : 'normal',
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          📋 Recommendations ({recommendations.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {currentDocs.length > 0 ? (
          currentDocs.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No {activeTab} available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};