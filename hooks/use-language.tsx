"use client"

import { useContext } from "react"
// Update the import path below if the file is not in 'components' at the project root
import { LanguageContext } from "../components/language-provider"

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}

