import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { TranslationProvider } from "@/lib/i18n/translation-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Free Cabins Europe",
  description: "Find free cabins and shelters across Europe"
}

/**
 * Root layout component that wraps all pages
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <TranslationProvider>
          <Header />
          <div className="min-h-screen bg-background">{children}</div>
          <Toaster />
        </TranslationProvider>
      </body>
    </html>
  )
}


import './globals.css'