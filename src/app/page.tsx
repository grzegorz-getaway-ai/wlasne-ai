'use client';

import React, { useState } from 'react';
import { Plus, Settings2, Play, Database, BrainCircuit, Activity, X } from 'lucide-react';

export default function WlasneAIDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [agents] = useState([
    { id: 1, name: 'Rezerwacje Restauracje', guidelines: 'Szukaj na Google Maps, wybieraj miejsca z oceną > 4.5', status: 'Gotowy' },
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 text-[#1e293b]" style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrainCircuit color="#2563eb" size={36} /> Własne AI
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Twoje centrum dowodzenia agentami</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} /> Dodaj Własne AI
          </button>
        </header>

        {/* Lista Agentów */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {agents.map((agent) => (
            <div key={agent.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{agent.name}</h3>
                <Settings2 size={18} color="#94a3b8" style={{ cursor: 'pointer' }} />
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px', minHeight: '42px' }}>{agent.guidelines}</p>
              <button style={{ width: '100%', backgroundColor: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Play size={16} /> Otwórz & Komenda
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Nowa Persona</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <input placeholder="Nazwa AI (np. Rezerwator)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <textarea placeholder="Wytyczne (Jak ma działać?)" rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={14}/> Narzędzia: WhatsApp, Mail (Wkrótce)</span>
              </div>
            </div>
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Anuluj</button>
              <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Zapisz w Pamięci</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
