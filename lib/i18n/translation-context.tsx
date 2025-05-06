"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, type Language } from "./translations"

type TranslationContextType = {
  t: (key: string) => string
  currentLanguage: Language
  changeLanguage: (lang: Language) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load language preference from localStorage on client side
    const savedLang = (localStorage.getItem("language") as Language) || "en"
    setCurrentLanguage(savedLang)
    document.documentElement.lang = savedLang
  }, [])

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[currentLanguage]

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        // Fallback to English if translation is missing
        let fallback = translations["en"]
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk]
          } else {
            return key // Return the key if translation is missing in both languages
          }
        }
        return typeof fallback === "string" ? fallback : key
      }
    }

    return typeof value === "string" ? value : key
  }

  return (
    <TranslationContext.Provider value={{ t, currentLanguage, changeLanguage }}>{children}</TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
