"use client"

import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key: string) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key]
    }

    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key]
    }

    // Return the key if no translation is found
    return key
  }

  return { t }
}

