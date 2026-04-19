// i18n setup — add a new JSON file under locales/ to support a new language
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';

const i18n = new I18n({ en, es, fr, hi, zh });

i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Set from device locale on first load; overridden by user setting later
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';

export default i18n;

export function setLocale(locale: string) {
  i18n.locale = locale;
}
