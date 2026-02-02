'use client';

import React, { useState } from 'react';
import { Plus, Settings2, Play, Database, BrainCircuit, Activity } from 'lucide-react';

export default function WlasneAIDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [agents, setAgents] = useState([
    { id: 1, name: 'Rezerwacje Restauracje', guidelines: 'Szukaj na Google Maps, wybieraj miejsca z oceną > 4.5', tools: 'Brak' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      {/* Header */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BrainCircuit className="text-blue-600" /> Własne AI
          </h1>
          <p className="text-slate-500">Zarządzaj swoimi autonomicznymi agentami</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
        >
          <Plus size={20} /> Dodaj Własne AI
        </button>
      </header>

      {/* Lista Agentów */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800">{agent.name}</h3>
              <Settings2 size={18} className="text-slate-400 cursor-pointer hover:text-blue-600" />
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-6">{agent.guidelines}</p>
            
            <div className="flex items-center gap-3 mt-auto">
              <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-md text-sm font-medium transition-colors">
                <Play size={16} /> Otwórz & Komenda
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Definicji AI (Wydmuszka) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Definicja Własnego AI</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 leading-none">Nazwa AI</label>
                <input type="text" placeholder="np. Asystent Rezerwacji" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Wytyczne (DNA bota)</label>
                <textarea rows={4} placeholder="Jak ma się zachowywać? Na co zwracać uwagę?" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <Database size={16} /> Narzędzia (Wkrótce)
                </label>
                <p className="text-xs text-slate-400 mt-1">Integracje z Whatsapp, Mail, Kalendarz...</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium">Anuluj</button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-blue-200 shadow-lg">Zapisz AI</button>
            </div>
          </div>
        </div>
      )}

      {/* Pasek Stanu Organizmu */}
      <footer className="fixed bottom-6 left-6 right-6 flex justify-center pointer-events-none">
        <div className="bg-white shadow-2xl border border-slate-200 px-6 py-3 rounded-full flex items-center gap-8 text-xs font-medium text-slate-400 pointer-events-auto">
           <div className="flex items-center gap-2 text-green-600"><Activity size={14}/> Układ krwionośny: OK</div>
           <div className="flex items-center gap-2 text-blue-600"><BrainCircuit size={14}/> Mózg: GPT-5.1</div>
           <div className="flex items-center gap-2 text-orange-600"><Settings2 size={14}/> Ręce: Browserbase</div>
        </div>
      </footer>
    </div>
  );
}
