import React, { useState } from 'react';
import "App.css";
function App() {
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userData.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData }),
      });

      if (!response.ok) throw new Error("Server failed to generate PDF");

      // --- NEW LOGIC: HANDLE BINARY PDF ---
      // 1. Convert response to a "Blob" (Binary Large Object)
      const blob = await response.blob();
      
      // 2. Create a temporary link to this blob
      const url = window.URL.createObjectURL(blob);
      
      // 3. Force the browser to click the link and download
      const link = document.createElement('a');
      link.href = url;
      link.download = "My_AI_Resume.pdf"; // The file name you want
      document.body.appendChild(link);
      link.click();
      
      // 4. Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>AI Resume Builder (Pro)</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <textarea
          rows="15"
          value={userData}
          onChange={(e) => setUserData(e.target.value)}
          placeholder="Paste your bio here. The AI will now generate a FULL page resume..."
          style={{ padding: '15px', fontSize: '16px', borderRadius: '8px' }}
        />

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <button 
          onClick={handleGenerate} 
          disabled={loading || !userData}
          style={{
            padding: '20px',
            fontSize: '18px',
            backgroundColor: loading ? '#bdc3c7' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing (Generating & Compiling)...' : 'Download Resume PDF'}
        </button>
      </div>
    </div>
  );
}

export default App;