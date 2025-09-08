import './globals.css';

export const metadata = {
  title: 'Plataforma Imobiliária',
  description: 'Sistema de gestão imobiliária',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}