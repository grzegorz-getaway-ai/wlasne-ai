"use client";
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!task) return;
    setLoading(true);
    setStatus('Inicjalizacja Własnego AI...');
    try {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      const data = await response.json();
      setStatus(data.plan || 'Zadanie przyjęte.');
    } catch (e) {
      setStatus('Wystąpił błąd podczas aktywacji.');
    }
    setLoading(false);
  };

  return (
    <main style={{backgroundColor: '#ffffff', color: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      <div style={{maxWidth: '600px', width: '100%', textAlign: 'center'}}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '200', fontStyle: 'italic', marginBottom: '10px', letterSpacing: '-2px', color: '#000'}}>wlasne.ai</h1>
        <p style={{color: '#888', marginBottom: '40px', fontSize: '1.1rem'}}>Przestań rozmawiać z botami. Wyślij własnego.</p>
        
        <div style={{backgroundColor: '#f9f9f9', borderRadius: '24px', padding: '8px', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'}}>
          <textarea 
            style={{width: '100%', height: '140px', backgroundColor: 'transparent', border: 'none', color: '#000', padding: '15px', outline: 'none', fontSize: '1.1rem', resize: 'none', lineHeight: '1.5'}}
            placeholder="Co mam dziś za Ciebie załatwić?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>

        <button 
          onClick={handleActivate}
          disabled={loading}
          style={{marginTop: '30px', padding: '18px 50px', backgroundColor: '#000', color: '#fff', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '1.05rem', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? (
            <span style={{opacity: 0.7}}>Pracuję...</span>
          ) : (
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Sparkles size={18} />
              <span>Aktywuj Własne AI</span>
            </div>
          )}
        </button>

        {status && (
          <div style={{marginTop: '50px', padding: '25px', backgroundColor: '#fcfcfc', borderRadius: '20px', border: '1px solid #f0f0f0', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.02)'}}>
            <p style={{color: '#0070f3', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'}}>Logi Twojego AI</p>
            <div style={{fontSize: '0.95rem', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
              {status}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
