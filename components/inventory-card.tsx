'use client';

import React from 'react';
import { MapPin, Clock, Star, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface InventoryItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  distance: number;
  storeId: string;
  storeName: string;
  storeRating: number;
  isVerified: boolean;
  status: string;
  imageUrl?: string;
  confidence?: number;
  reason?: string;
  marketInfo?: {
    name: string;
    brand: string;
    price: number;
    description: string;
  };
}

export function InventoryCard({ item, onFeedback }: { item: InventoryItem, onFeedback?: (item: any) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all group"
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 aspect-square bg-zinc-800">
          <Image
            src={item.imageUrl || `https://picsum.photos/seed/${item.sku}/400/400`}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {item.confidence && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Sugestão IA
            </div>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-zinc-100 leading-tight font-serif italic">{item.name}</h3>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-emerald-400 tracking-tighter">
                  R$ {item.price.toFixed(2)}
                </span>
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                  VALOR_UNITARIO
                </div>
              </div>
            </div>
            
            {item.reason && (
              <p className="text-xs text-zinc-500 italic mb-2 font-serif">&quot;{item.reason}&quot;</p>
            )}

            {item.marketInfo && (
              <div className="mb-4 p-3 bg-zinc-800/30 rounded-2xl border border-zinc-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono font-bold text-emerald-500/70 uppercase tracking-[0.2em]">REF_GOOGLE_SHOPPING</span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{item.marketInfo.description}</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-2">
                  MARKET_AVG: <span className="text-zinc-300">R$ {item.marketInfo.price?.toFixed(2)}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-zinc-800/50 pt-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 text-emerald-500/50" />
                <span className="text-xs font-mono tracking-tighter">{item.distance.toFixed(2)} KM_DISTANCIA</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="w-4 h-4 text-emerald-500/50" />
                <span className="text-[10px] font-mono uppercase tracking-wider">ESTOQUE_A_CONFIRMAR</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800/50 border border-zinc-700/30 rounded-xl flex items-center justify-center text-zinc-500 font-mono font-bold">
                {item.storeName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{item.storeName}</span>
                  {item.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-500/70" />}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500/50 fill-yellow-500/20" />
                  <span className="text-[10px] font-mono text-zinc-600">{item.storeRating.toFixed(1)} SCORE</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => onFeedback?.(item)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-500 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
              >
                Confirmar Estoque
              </button>
              <button 
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${item.name}+${item.storeName}`;
                  window.open(url, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-emerald-500 text-zinc-100 rounded-xl transition-all group/btn"
              >
                <span className="text-sm font-semibold">Ver Rota</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
