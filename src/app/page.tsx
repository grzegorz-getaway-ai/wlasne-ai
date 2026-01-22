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
    <main style={{backgroundColor: '#0a0a0a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif'}}>
      <div style={{maxWidth: '600px', width: '100%', textAlign: 'center'}}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '200', fontStyle: 'italic', marginBottom: '10px', letterSpacing: '-2px'}}>wlasne.ai</h1>
        <p style={{color: '#666', marginBottom: '40px'}}>Przestań rozmawiać z botami. Wyślij własnego.</p>
        
        <div style={{backgroundColor: '#111', borderRadius: '20px', padding: '5px', border: '1px solid #222'}}>
          <textarea 
            style={{width: '100%', height: '120px', backgroundColor: 'transparent', border: 'none', color: 'white', padding: '15px', outline: 'none', fontSize: '1rem', resize: 'none'}}
            placeholder="Co mam dziś za Ciebie załatwić?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>

        <button 
          onClick={handleActivate}
          disabled={loading}
          style={{marginTop: '30px', padding: '18px 45px', backgroundColor: 'white', color: 'black', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'all 0.2s'}}
        >
          {loading ? 'Pracuję...' : 'Aktywuj Własne AI'}
        </button>

        {status && (
          <div style={{marginTop: '40px', padding: '20px', backgroundColor: '#111', borderRadius: '15px', border: '1px solid #222', textAlign: 'left'}}>
            <p style={{color: '#4488ff', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase'}}>Logi Twojego AI:</p>
            <div style={{fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5', whiteSpace: 'pre-wrap'}}>
              {status}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
