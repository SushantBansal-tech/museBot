"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { LanguageSelector } from "../components/language-selector"
import { ThemeToggle } from "../components/theme-toggle"
import { Menu, X } from "lucide-react"
import { useTranslation } from "../hooks/use-translation"
import { useMobile } from "../hooks/use-mobile"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { t } = useTranslation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">MuseumTix</span>
          </Link>
        </div>

        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 flex flex-col gap-4">
                <Link href="/" onClick={toggleMenu}>
                  {t("home")}
                </Link>
                <Link href="/tickets" onClick={toggleMenu}>
                  {t("tickets")}
                </Link>
                <Link href="/about" onClick={toggleMenu}>
                  {t("about")}
                </Link>
                <Link href="/contact" onClick={toggleMenu}>
                  {t("contact")}
                </Link>
                <Link href="/dashboard" onClick={toggleMenu}>
                  {t("dashboard")}
                </Link>
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="font-medium transition-colors hover:text-primary">
                {t("home")}
              </Link>
              <Link href="/tickets" className="font-medium transition-colors hover:text-primary">
                {t("tickets")}
              </Link>
              <Link href="/about" className="font-medium transition-colors hover:text-primary">
                {t("about")}
              </Link>
              <Link href="/contact" className="font-medium transition-colors hover:text-primary">
                {t("contact")}
              </Link>
              <Link href="/dashboard" className="font-medium transition-colors hover:text-primary">
                {t("dashboard")}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <Button asChild>
                <Link href="/chat">{t("book_now")}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

