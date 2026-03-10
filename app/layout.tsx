import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'Itemap - Catálogo Guiado',
  description: 'Encontre o item que você precisa no estoque físico mais próximo.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
