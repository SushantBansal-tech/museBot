"use client"

import Link from "next/link"
import { useState } from "react"
<<<<<<< HEAD
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, LogIn, LogOut, UserPlus } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { useMobile } from "@/hooks/use-mobile"
import { useSession, signOut } from "next-auth/react"
=======
import { Button } from "../components/ui/button"
import { LanguageSelector } from "../components/language-selector"
import { ThemeToggle } from "../components/theme-toggle"
import { Menu, X } from "lucide-react"
import { useTranslation } from "../hooks/use-translation"
import { useMobile } from "../hooks/use-mobile"
>>>>>>> 98b11b37ee556358b2ef7fdc14c5678342628e26

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { t } = useTranslation()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">MuseBot</span>
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
                {isAuthenticated && (
                  <Link href="/dashboard" onClick={toggleMenu}>
                    {t("dashboard")}
                  </Link>
                )}
                
                {/* Auth links for mobile */}
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" onClick={toggleMenu} className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t("login")}
                    </Link>
                    <Link href="/register" onClick={toggleMenu} className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t("register")}
                    </Link>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      signOut({ callbackUrl: "/" })
                      toggleMenu()
                    }}
                    className="flex items-center gap-2 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                )}
                
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
              {isAuthenticated && (
                <Link href="/dashboard" className="font-medium transition-colors hover:text-primary">
                  {t("dashboard")}
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              
              {/* Auth buttons for desktop */}
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t("login")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/register" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t("register")}
                    </Link>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </Button>
              )}
              
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