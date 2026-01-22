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
      
      if (data.success) {
        setStatus(data.plan);
      } else {
        setStatus('BŁĄD: ' + (data.error || 'Nieznany błąd serwera.'));
      }
    } catch (e) {
      setStatus('BŁĄD POŁĄCZENIA: Upewnij się, że masz skonfigurowane klucze API na Vercel.');
    }
    setLoading(false);
  };

  return (
    <main style={{backgroundColor: '#ffffff', color: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif'}}>
      <div style={{maxWidth: '600px', width: '100%', textAlign: 'center'}}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '200', fontStyle: 'italic', marginBottom: '10px', letterSpacing: '-2px', color: '#000'}}>wlasne.ai</h1>
        <p style={{color: '#888', marginBottom: '40px', fontSize: '1.1rem'}}>Przestań rozmawiać z botami. Wyślij własnego.</p>
        
        <div style={{backgroundColor: '#f9f9f9', borderRadius: '24px', padding: '8px', border: '1px solid #eee'}}>
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
          style={{marginTop: '30px', padding: '18px 50px', backgroundColor: '#000', color: '#fff', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '1.05rem'}}
        >
          {loading ? 'Aktywacja...' : 'Aktywuj Własne AI'}
        </button>

        {status && (
          <div style={{marginTop: '50px', padding: '25px', backgroundColor: '#fcfcfc', borderRadius: '20px', border: '1px solid #f0f0f0', textAlign: 'left'}}>
            <p style={{color: '#0070f3', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase'}}>Logi Twojego AI</p>
            <div style={{fontSize: '0.95rem', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
              {status}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
