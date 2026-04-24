import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh'
import en from './locales/en'

const LANG_KEY = 'wsl-manager-lang'

function getDefaultLang(): string {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved) return saved
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en }
  },
  lng: getDefaultLang(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export function setLanguage(lang: string): void {
  i18n.changeLanguage(lang)
  localStorage.setItem(LANG_KEY, lang)
}

export function getCurrentLanguage(): string {
  return i18n.language
}

export default i18n
