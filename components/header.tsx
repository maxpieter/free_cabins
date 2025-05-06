'use client'

import Link from "next/link"
import { MountainSnow } from "lucide-react"
import { LanguageSelector } from "./language-selector"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 pl-4">
          <Link href="/" className="flex items-center gap-2">
            <MountainSnow className="h-6 w-6" />
            <span className="font-bold">{t("common.freeCabins")}</span>
          </Link>
          <nav>
            <ul className="flex gap-4">
              <li>
                <Button variant="link" asChild className="p-0">
                  <Link href="/about">{t("common.about")}</Link>
                </Button>
              </li>
              <li>
                <Button variant="link" asChild className="p-0">
                  <Link href="/faq">{t("common.faq")}</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
