/**
 * i18next TypeScript declarations
 * Provides type-safe translation keys
 */

import 'i18next';
import type { resources, defaultNS } from './index';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
