import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getCurrentTenant } from '@/lib/tenant';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
  
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    messages = (await import(`../../../messages/pt-BR.json`)).default;
  }
  
  console.log(`LAYOUT: Loading locale=${locale}, home=${messages?.common?.home}`);
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TenantProvider tenant={tenant}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}