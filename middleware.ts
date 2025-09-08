import createMiddleware from 'next-intl/middleware';
import {routing} from './src/lib/routing';

export default createMiddleware(routing);

export const config = {
  // Corresponder apenas aos pathnames internacionalizados
  matcher: ['/', '/(pt-BR|es-PY|en-US|gn-PY)/:path*']
};