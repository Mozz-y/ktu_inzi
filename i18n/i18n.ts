import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import lt from './locales/lt.json';
import ru from './locales/ru.json';

const locales = Localization.getLocales();
const languageCode = locales?.[0]?.languageCode ?? 'en';
const language = languageCode === 'lt' ? 'lt' : 'en';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      lt: { translation: lt },
      ru: { translation: ru },
      de: { translation: de },
      fr: { translation: fr }
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });
}

export default i18n;