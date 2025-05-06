"use client"

import { useEffect, useState, type ReactNode } from "react"

interface ClientOnlyProps {
  children: ReactNode
}

// This component ensures its children are only rendered on the client
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }

  return <>{children}</>
}
