'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings2, Play, Database, BrainCircuit, X, Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function WlasneAIDashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stany dla Modali
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // Dane formularza (używane zarówno do dodawania, jak i edycji)
  const [agentName, setAgentName] = useState('');
  const [agentGuidelines, setAgentGuidelines] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stan Komendy
  const [command, setCommand] = useState('');

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ai_agents').select('*').order('created_at', { ascending: false });
    if (!error && data) setAgents(data);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  // Otwieranie formularza do edycji
  const openEditModal = (agent: any) => {
    setSelectedAgent(agent);
    setAgentName(agent.name);
    setAgentGuidelines(agent.guidelines);
    setIsEditing(true);
    setShowPersonaModal(true);
  };

  // Otwieranie formularza do komendy
  const openCommandModal = (agent: any) => {
    setSelectedAgent(agent);
    setCommand('');
    setShowCommandModal(true);
  };

  // Zapisywanie (Nowy lub Edycja)
  const handleSave = async () => {
    if (!agentName) return alert('Podaj nazwę AI');
    setSaving(true);

    let error;
    if (isEditing && selectedAgent) {
      const { error: err } = await supabase
        .from('ai_agents')
        .update({ name: agentName, guidelines: agentGuidelines })
        .eq('id', selectedAgent.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('ai_agents')
        .insert([{ name: agentName, guidelines: agentGuidelines }]);
      error = err;
    }

    if (error) alert('Błąd: ' + error.message);
    else {
      setShowPersonaModal(false);
      resetForm();
      fetchAgents();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setAgentName('');
    setAgentGuidelines('');
    setIsEditing(false);
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 text-[#1e293b]" style={{ fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrainCircuit color="#2563eb" size={36} /> Własne AI
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Twoje centrum dowodzenia agentami</p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowPersonaModal(true); }}
            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} /> Dodaj Własne AI
          </button>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="#2563eb" size={32} /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {agents.map((agent) => (
              <div key={agent.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{agent.name}</h3>
                  <Settings2 size={18} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => openEditModal(agent)} />
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px', minHeight: '42px', overflow: 'hidden' }}>{agent.guidelines || 'Brak wytycznych...'}</p>
                <button 
                  onClick={() => openCommandModal(agent)}
                  style={{ width: '100%', backgroundColor: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Play size={16} /> Otwórz & Komenda
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Definicja / Edycja AI */}
      {showPersonaModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? 'Edytuj AI' : 'Nowa Persona'}</h2>
              <button onClick={() => setShowPersonaModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Nazwa AI</label>
                <input value={agentName} onChange={(e) => setAgentName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Wytyczne (DNA bota)</label>
                <textarea value={agentGuidelines} onChange={(e) => setAgentGuidelines(e.target.value)} rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowPersonaModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600' }}>Anuluj</button>
              <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold' }}>
                {saving ? 'Zapisywanie...' : 'Zapisz w Pamięci'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Okno Komendy (Mózg w akcji) */}
      {showCommandModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '800px', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', background: '#1e293b', color: 'white', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BrainCircuit size={24} color="#60a5fa" />
                <h2 style={{ margin: 0 }}>Terminal: {selectedAgent?.name}</h2>
              </div>
              <button onClick={() => setShowCommandModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px' }}>
                <strong>Aktywne wytyczne:</strong> {selectedAgent?.guidelines}
              </div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Wydaj komendę dla bota:</label>
              <textarea 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="np. Zarezerwuj stolik w restauracji Nobu na jutro na 19:00..." 
                rows={3} 
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', boxSizing: 'border-box' }} 
              />
              
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', color: '#94a3b8', fontSize: '12px', minHeight: '100px', fontFamily: 'monospace' }}>
                {'>'} Oczekiwanie na komendę...
              </div>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} /> Wykonaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
