"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    // Get language from localStorage or browser settings
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      const browserLang = navigator.language.split("-")[0]
      const supportedLanguages = ["en", "es", "fr", "de", "zh"]
      if (supportedLanguages.includes(browserLang)) {
        setLanguage(browserLang)
      }
    }
  }, [])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>{children}</LanguageContext.Provider>
  )
}

