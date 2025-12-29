import React, { useState } from 'react';
import "./App.css";

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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "My_AI_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... imports and logic ...

  return (
    <div className="app-container">
      <h1>AI Resume Builder <span style={{fontSize: '0.5em', opacity: 0.5}}>PRO</span></h1>
      
      <div className="input-group">
        <textarea
          rows="15"
          value={userData}
          onChange={(e) => setUserData(e.target.value)}
          placeholder="> Paste your bio here..."
          spellCheck="false"
        />

        {error && <div className="error-msg">{error}</div>}

        <button 
          className="action-btn"
          onClick={handleGenerate} 
          disabled={loading || !userData}
        >
          {loading ? 'Compiling LaTeX...' : 'Generate Resume PDF'}
        </button>
      </div>

      {/* --- NEW FOOTER --- */}
      <div className="footer">
        made with <span className="heart">♥</span> by sam
      </div>

    </div>
  );
}

export default App;