import React, { useState } from 'react';

function App() {
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerate = async () => {
    // 1. Basic validation
    if (!userData.trim()) return;
    
    // 2. Reset states
    setLoading(true);
    setError('');
    setPdfUrl(null);

    try {
      console.log("Sending request...");
      
      // 3. API Call
      // Note: We use relative path '/api/...' so it works on Render automatically
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      });

      const data = await response.json();

      // 4. Check for server errors
      if (!response.ok) {
        throw new Error(data.error || `Server Error: ${response.status}`);
      }

      // 5. Success! Save the URL to state
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      } else {
        throw new Error("No URL returned from server");
      }

    } catch (err) {
      console.error("Frontend Error:", err);
      setError(err.message || 'Failed to generate resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>AI Resume Builder</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label htmlFor="bio" style={{ fontWeight: 'bold' }}>
          Paste your bio, skills, and experience below:
        </label>
        
        <textarea
          id="bio"
          rows="15"
          value={userData}
          onChange={(e) => setUserData(e.target.value)}
          placeholder="I am a Full Stack Developer with 3 years of experience..."
          style={{ 
            padding: '12px', 
            fontSize: '16px', 
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontFamily: 'inherit'
          }}
        />

        {/* Error Message Area */}
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#ffe6e6', 
            color: '#d63031', 
            borderRadius: '5px',
            border: '1px solid #ff7675'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Action Button */}
        <button 
          onClick={handleGenerate} 
          disabled={loading || !userData}
          style={{
            padding: '15px',
            fontSize: '18px',
            backgroundColor: loading ? '#b2bec3' : '#0984e3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'Generating (Please wait up to 30s)...' : 'Generate Resume PDF'}
        </button>

        {/* Success Area - Shows only when PDF is ready */}
        {pdfUrl && (
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#dff9fb', 
            border: '1px solid #badc58', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2ecc71' }}>Resume Ready!</h3>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                backgroundColor: '#00b894',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Download PDF Now
            </a>
          </div>
        )}
      </div>
      
      <p style={{ marginTop: '30px', fontSize: '0.85em', color: '#636e72', textAlign: 'center' }}>
        Powered by Gemini AI & Latex-Online.
      </p>
    </div>
  );
}

export default App;