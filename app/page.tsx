'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Info, Activity, DollarSign, Map as MapIcon, User, Building2, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * PROTOCOLO ITEMAP - ESPECIFICAÇÃO DE SISTEMAS SÊNIOR
 * ARQUITETURA: MÁQUINA REAL / INTERFACE FRIA
 */

interface Specs {
  [key: string]: string | number;
}

interface LocalInventory {
  id: string;
  sku: string;
  name: string;
  specs: Specs;
  lat: number;
  lng: number;
  stockCount: number;
  price: number;
}

interface TransactionLog {
  id: string;
  itemName: string;
  value: number;
  royalty: number;
  timestamp: string;
}

// SIMULAÇÃO DE LOCALIZAÇÃO DO USUÁRIO (SÃO PAULO - CENTRO)
const USER_COORDS = { lat: -23.5505, lng: -46.6333 };
const DISTANCE_CONSTRAINT_KM = 20;
const ROYALTY_RATE = 0.05;

// CAMADA DE DADOS: LÓGICA DE MATÉRIA
const INVENTORY_DATA: LocalInventory[] = [
  {
    id: '1',
    sku: 'WAP-GTX-01',
    name: 'Aspirador Wap GTX',
    specs: { power: '2000W', capacity: '20L', voltage: '220V', type: 'Industrial' },
    lat: -23.5600,
    lng: -46.6400,
    stockCount: 5,
    price: 899.00
  },
  {
    id: '2',
    sku: 'PHIL-PH10-02',
    name: 'Aspirador Philco PH10',
    specs: { power: '1800W', capacity: '15L', voltage: '220V', type: 'Doméstico' },
    lat: -23.5800,
    lng: -46.6800,
    stockCount: 2,
    price: 450.00
  },
  {
    id: '3',
    sku: 'ELEC-ERGO-03',
    name: 'Electrolux Ergorapido',
    specs: { power: '1500W', capacity: '10L', voltage: 'Bivolt', type: 'Sem Fio' },
    lat: -23.4500, // > 20km
    lng: -46.5000,
    stockCount: 10,
    price: 1200.00
  },
  {
    id: '4',
    sku: 'WAP-GTX-ALT',
    name: 'Aspirador Wap GTX (Substituto)',
    specs: { power: '2000W', capacity: '20L', voltage: '220V', type: 'Industrial', color: 'Black' },
    lat: -23.5450,
    lng: -46.6300,
    stockCount: 3,
    price: 910.00
  },
  {
    id: '5',
    sku: 'WAP-GTX-220',
    name: 'Aspirador Wap GTX 220V',
    specs: { power: '2000W', capacity: '20L', voltage: '220V', type: 'Industrial' },
    lat: -23.5550,
    lng: -46.6350,
    stockCount: 1,
    price: 895.00
  }
];

/**
 * MOTOR DE BUSCA: FÓRMULA DE HAVERSINE
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * PROTOCOLO ASA: ATTRIBUTE SIMILARITY ANALYSIS
 */
function compareSpecs(target: Specs, candidate: Specs): number {
  const targetKeys = Object.keys(target);
  if (targetKeys.length === 0) return 0;
  
  let matches = 0;
  targetKeys.forEach(key => {
    if (candidate[key] === target[key]) {
      matches++;
    }
  });
  
  return matches / targetKeys.length;
}

function generateId() {
  return Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<TransactionLog[]>([]);

  const processedResults = useMemo(() => {
    if (!query) return [];

    const searchTarget = INVENTORY_DATA.find(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      item.sku.toLowerCase().includes(query.toLowerCase())
    );

    return INVENTORY_DATA.map(item => {
      const distance = calculateDistance(USER_COORDS.lat, USER_COORDS.lng, item.lat, item.lng);
      const isWithinRange = distance <= DISTANCE_CONSTRAINT_KM;
      
      let similarity = 0;
      if (searchTarget && searchTarget.id !== item.id) {
        similarity = compareSpecs(searchTarget.specs, item.specs);
      }

      const isExactMatch = item.name.toLowerCase().includes(query.toLowerCase()) || 
                           item.sku.toLowerCase().includes(query.toLowerCase());

      return {
        ...item,
        distance,
        isWithinRange,
        similarity,
        isExactMatch,
        isSubstitute: similarity >= 0.9 && isWithinRange && !isExactMatch
      };
    })
    .filter(item => item.isExactMatch || item.isSubstitute)
    .sort((a, b) => a.distance - b.distance); // EFICIÊNCIA: PROXIMIDADE > DISPONIBILIDADE
  }, [query]);

  const handleSimulateTransaction = (item: any) => {
    const royalty = item.price * ROYALTY_RATE;
    const newLog: TransactionLog = {
      id: generateId(),
      itemName: item.name,
      value: item.price,
      royalty,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] font-mono flex flex-col md:flex-row overflow-hidden">
      {/* PAINEL PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="border-b border-[#333] p-6 bg-[#111] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MapIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase">Itemap</h1>
              <p className="text-[9px] text-[#666] uppercase tracking-widest">Soberania Geográfica // ASA Protocol</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-[#666] uppercase">Localização Atual</span>
              <span className="text-[10px] text-zinc-400">LAT: {USER_COORDS.lat} LNG: {USER_COORDS.lng}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center gap-3 bg-[#000] border border-[#333] px-4 py-3 rounded-lg">
                <Search className="w-5 h-5 text-[#666]" />
                <input 
                  type="text" 
                  placeholder="DIGITE SKU OU NOME DO ITEM PARA LOCALIZAÇÃO..." 
                  className="bg-transparent border-none outline-none text-xs w-full uppercase tracking-wider"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#666] uppercase tracking-widest px-1">
              <span>Resultados da Busca // Raio de 20km</span>
              <span>{processedResults.length} Itens Encontrados</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-6 pb-20">
          <div className="max-w-2xl mx-auto space-y-4">
            <AnimatePresence mode="popLayout">
              {processedResults.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-20 text-center border border-[#333] border-dashed rounded-3xl"
                >
                  <Info className="w-12 h-12 text-[#222] mx-auto mb-4" />
                  <p className="text-[#444] text-xs uppercase italic">Aguardando entrada de dados para processamento geográfico...</p>
                </motion.div>
              ) : (
                processedResults.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative p-6 bg-[#111] border border-[#333] rounded-2xl transition-all ${item.isWithinRange ? 'hover:border-emerald-500/50' : 'opacity-50 grayscale'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight">{item.name}</h3>
                          {item.isSubstitute && (
                            <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">ASA SUGGESTION ({(item.similarity * 100).toFixed(0)}%)</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#666] uppercase font-mono">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400 font-mono">R$ {item.price.toFixed(2)}</div>
                        <div className="text-[9px] text-[#666] uppercase tracking-tighter">Estoque: {item.stockCount} UNIDADES</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222]">
                      <div className="flex items-center gap-2 text-[10px] uppercase">
                        <MapPin className={`w-3.5 h-3.5 ${item.isWithinRange ? 'text-emerald-500' : 'text-red-500'}`} />
                        <span className="font-mono">{item.distance.toFixed(2)} KM</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] uppercase justify-end">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isWithinRange ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={item.isWithinRange ? 'text-zinc-400' : 'text-red-500 font-bold'}>
                          {item.isWithinRange ? 'Posse Imediata' : 'Indisponível'}
                        </span>
                      </div>
                    </div>

                    {item.isWithinRange && (
                      <button 
                        onClick={() => handleSimulateTransaction(item)}
                        className="mt-6 w-full bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                      >
                        Simular Aquisição
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* LOG LATERAL: ROYALTIES */}
      <aside className="w-full md:w-96 border-l border-[#333] bg-[#0a0a0a] flex flex-col h-screen">
        <div className="p-6 border-b border-[#333] bg-[#111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs uppercase font-bold tracking-widest">Log de Transações</h2>
          </div>
          <span className="text-[9px] text-[#666] uppercase">Taxa: 5%</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <div className="text-[10px] text-[#333] uppercase italic text-center py-10">Nenhuma atividade registrada no ledger.</div>
            ) : (
              logs.map(log => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-[#111] border border-[#222] rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#666] font-mono">{log.timestamp}</span>
                    <span className="text-[10px] font-bold text-emerald-500">ROYALTY: +R$ {log.royalty.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-200 uppercase font-bold truncate">{log.itemName}</div>
                  <div className="flex items-center justify-between text-[9px] text-[#444] uppercase">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" />
                      <span>Base: {log.value.toFixed(2)}</span>
                    </div>
                    <span className="font-mono">ID: {log.id}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-[#333] bg-[#111]">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase text-[#666]">
              <span>Acumulado Royalties</span>
              <span className="font-mono">BRL</span>
            </div>
            <div className="text-3xl font-bold text-emerald-500 font-mono tracking-tighter">
              R$ {logs.reduce((acc, curr) => acc + curr.royalty, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
