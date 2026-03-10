'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    sku: string;
    name: string;
    storeId: string;
    storeName: string;
  };
}

export function FeedbackModal({ isOpen, onClose, item }: FeedbackModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = async (wasAvailable: boolean) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Add feedback record
      await addDoc(collection(db, 'feedbacks'), {
        userId: user.uid,
        storeId: item.storeId,
        sku: item.sku,
        wasAvailable,
        timestamp: new Date().toISOString()
      });

      // 2. Update user reputation (simple logic)
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        reputation: increment(wasAvailable ? 5 : 2) // Rewarding contribution
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">Obrigado!</h3>
                <p className="text-zinc-500">Seu feedback ajuda a manter o inventário global atualizado.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Confirmar Estoque</h2>
                  <p className="text-zinc-500">
                    Você encontrou o item <span className="text-zinc-100 font-medium">{item.name}</span> em <span className="text-zinc-100 font-medium">{item.storeName}</span>?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleFeedback(true)}
                    className="flex flex-col items-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all group"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-emerald-500">Sim, está lá</span>
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleFeedback(false)}
                    className="flex flex-col items-center gap-3 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all group"
                  >
                    <XCircle className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-red-500">Não encontrei</span>
                  </button>
                </div>

                {isSubmitting && (
                  <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando feedback...</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
