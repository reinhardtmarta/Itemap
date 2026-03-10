'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { User, History, Award, MapPin, CheckCircle2, XCircle, Loader2, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback } from 'react';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      if (!userSnap.empty) {
        setUserData(userSnap.docs[0].data());
      }

      const feedbackQuery = query(
        collection(db, 'feedbacks'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const feedbackSnap = await getDocs(feedbackQuery);
      setFeedbacks(feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
        <p>Por favor, faça login para ver seu perfil.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
          <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center text-black text-4xl font-bold">
            {user.displayName?.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-zinc-500">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold">{userData?.reputation || 100} Reputação</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold">Histórico de Verificação</h2>
            </div>
            <div className="space-y-4">
              {feedbacks.length > 0 ? feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-medium">{fb.sku}</p>
                    <p className="text-xs text-zinc-500">{new Date(fb.timestamp).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {fb.wasAvailable ? (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Confirmado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Indisponível</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                  <p className="text-zinc-500 text-sm">Nenhuma atividade recente.</p>
                </div>
              )}
            </div>
          </div>

          {/* Reputation Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold">Status de Reputação</h2>
            </div>
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Nível de Confiança</span>
                  <span className="text-emerald-500 font-bold">Excelente</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                </div>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Sua reputação é baseada na precisão dos seus feedbacks de estoque. 
                Usuários com alta reputação têm suas verificações priorizadas no algoritmo global.
              </p>
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 text-zinc-400">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Contribuiu com 12 locais verificados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
