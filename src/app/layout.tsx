import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Plataforma Imobiliaria',
  description: 'Sistema imobiliario white-label',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}