import React, { useState } from 'react';

function App() {
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userData.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      // Note: We use a relative path '/api/...' which works 
      // for both local (via proxy) and production (via express static)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.pdfUrl) {
        // Open PDF in new tab
        window.open(data.pdfUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate resume. Try shorter text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'sans-serif' 
    }}>
      <h1 style={{ textAlign: 'center' }}>AI Resume Builder</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label htmlFor="bio">
          Paste your bio, skills, and experience below:
        </label>
        
        <textarea
          id="bio"
          rows="15"
          value={userData}
          onChange={(e) => setUserData(e.target.value)}
          placeholder="I am a Software Engineer with 5 years of experience in JavaScript..."
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button 
          onClick={handleGenerate} 
          disabled={loading || !userData}
          style={{
            padding: '15px',
            fontSize: '18px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating LaTeX & Compiling PDF...' : 'Generate Resume PDF'}
        </button>
      </div>
      
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        *Note: This tool uses Gemini to write LaTeX code and Latex-Online to compile it.
      </p>
    </div>
  );
}

export default App;