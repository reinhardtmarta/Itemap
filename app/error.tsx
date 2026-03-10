'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/20 mb-8">
        <AlertCircle className="w-10 h-10 text-black" />
      </div>
      <h1 className="text-4xl font-bold tracking-tighter mb-2">Algo deu errado!</h1>
      <p className="text-zinc-500 mb-8 text-center max-w-md">
        Ocorreu um erro inesperado no Itemap. Estamos trabalhando para resolver.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold rounded-2xl transition-all border border-zinc-800"
      >
        <RotateCcw className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  );
}
