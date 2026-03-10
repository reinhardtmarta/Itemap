'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Building2, Plus, Package, TrendingUp, ShieldCheck, MapPin, Loader2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback } from 'react';

export default function CompanyDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', price: '', quantity: '' });

  const fetchStoreData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const storeQuery = query(collection(db, 'stores'), where('ownerUid', '==', user.uid));
      const storeSnap = await getDocs(storeQuery);
      
      if (!storeSnap.empty) {
        const storeDoc = storeSnap.docs[0];
        const storeData = { id: storeDoc.id, ...storeDoc.data() };
        setStore(storeData);

        const invQuery = query(collection(db, 'inventory'), where('storeId', '==', storeDoc.id));
        const invSnap = await getDocs(invQuery);
        setInventory(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error("Error fetching store data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    try {
      const itemData = {
        storeId: store.id,
        sku: newItem.sku,
        name: newItem.name,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity),
        lastUpdated: new Date().toISOString(),
        status: 'Disponível'
      };

      await addDoc(collection(db, 'inventory'), itemData);
      setNewItem({ name: '', sku: '', price: '', quantity: '' });
      setIsAdding(false);
      fetchStoreData();
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <Building2 className="w-16 h-16 text-zinc-800 mx-auto" />
          <h2 className="text-3xl font-bold">Gerencie seu Inventário</h2>
          <p className="text-zinc-500">Você ainda não tem uma loja cadastrada. Comece a vender para usuários próximos.</p>
          <button 
            onClick={async () => {
              const newStore = {
                name: `${user?.displayName}'s Store`,
                ownerUid: user?.uid,
                location: { lat: -23.5505, lng: -46.6333 }, // Default SP
                isVerified: false,
                rating: 5.0,
                googlePlaceId: ''
              };
              await addDoc(collection(db, 'stores'), newStore);
              fetchStoreData();
            }}
            className="w-full py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all"
          >
            Cadastrar Minha Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{store.name}</h1>
              {store.isVerified && <ShieldCheck className="w-6 h-6 text-emerald-500" />}
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <MapPin className="w-4 h-4" />
              <span>São Paulo, SP</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">124 Visitas Confirmadas</span>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Item</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-2">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Selo Verificado</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{store.isVerified ? 'Ativo' : 'Pendente'}</span>
              <ShieldCheck className={`w-8 h-8 ${store.isVerified ? 'text-emerald-500' : 'text-zinc-700'}`} />
            </div>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-2">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Pay-per-Visit (Ganhos)</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">R$ 1.240,00</span>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-2">
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Itens Ativos</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{inventory.length}</span>
              <Package className="w-8 h-8 text-zinc-700" />
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">Gestão de Estoque</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800">
                  <th className="px-6 py-4 font-semibold">Item</th>
                  <th className="px-6 py-4 font-semibold">SKU</th>
                  <th className="px-6 py-4 font-semibold">Preço</th>
                  <th className="px-6 py-4 font-semibold">Estoque</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-sm">{item.sku}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">R$ {item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{item.quantity} un</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg uppercase">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold">Novo Item no Inventário</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Nome do Produto</label>
                <input 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">SKU / Modelo</label>
                  <input 
                    required
                    value={newItem.sku}
                    onChange={e => setNewItem({...newItem, sku: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Preço (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Quantidade em Estoque</label>
                <input 
                  required
                  type="number"
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl font-bold transition-all"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}
