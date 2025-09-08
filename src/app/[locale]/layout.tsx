import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { getCurrentTenant } from '@/lib/tenant';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const validLocales = ['pt-BR', 'es-PY', 'en-US', 'gn-PY'];
  
  if (!validLocales.includes(locale)) {
    notFound();
  }

  const tenant = await getCurrentTenant();
  
  // Carrega as mensagens baseado no locale da URL
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    messages = (await import(`../../../messages/pt-BR.json`)).default;
  }

  console.log(`LAYOUT: Loading locale=${locale}, home=${messages?.common?.home}`);

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Plataforma Imobiliária</title>
      </head>
      <body className={inter.className}>
        <TenantProvider tenant={tenant} locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </TenantProvider>
      </body>
    </html>
  );
}