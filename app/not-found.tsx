import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8">
        <MapPin className="w-10 h-10 text-black" />
      </div>
      <h1 className="text-4xl font-bold tracking-tighter mb-2">404 - Página não encontrada</h1>
      <p className="text-zinc-500 mb-8 text-center max-w-md">
        Parece que você se perdeu no Itemap. O item que você procura não está aqui.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
