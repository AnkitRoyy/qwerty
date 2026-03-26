import { useParams, useNavigate } from 'react-router-dom'

export default function TeamPage() {
  const { teamName } = useParams()
  const navigate = useNavigate()

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#020617',
      color: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', color: '#38bdf8', marginBottom: '2rem' }}>
        {teamName}
      </h1>
      
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '3rem' }}>
        Welcome to the dedicated page for {teamName}.
      </p>

      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '12px 24px',
          background: 'transparent',
          color: '#38bdf8',
          border: '1px solid #38bdf8',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(56, 189, 248, 0.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'transparent';
        }}
      >
        ← Back to Map
      </button>
    </div>
  )
}
