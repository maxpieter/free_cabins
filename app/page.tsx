import { initDatabase } from "@/lib/db"
import CabinMap from "@/components/cabin-map"
import FilterSidebar from "@/components/filter-sidebar"
import { getCabins } from "@/lib/data"
import { Suspense } from "react"

export default async function Home() {
  await initDatabase()
  const cabins = await getCabins()

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        <Suspense fallback={<div className="p-4">Loading filters...</div>}>
          <FilterSidebar cabins={cabins} />
        </Suspense>
        <CabinMap cabins={cabins} />
      </div>
    </main>
  )
}