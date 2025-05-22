"use client"

import { Button } from "../components/ui/button"
import Link from "next/link"
import { useTranslation } from "../hooks/use-translation"
import Image from "next/image"

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">{t("hero_title")}</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">{t("hero_description")}</p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/chat">{t("book_tickets")}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">{t("learn_more")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=500&width=800"
              alt="Museum entrance"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

