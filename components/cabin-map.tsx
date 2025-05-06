import type { Cabin } from "@/lib/types"
import ClientOnly from "./map/client-only-map"
import MapContent from "./map/map-content"

interface CabinMapProps {
  cabins: Cabin[]
}

/**
 * Map component for displaying multiple cabins
 */
export default function CabinMap({ cabins }: CabinMapProps) {
  return (
    <ClientOnly>
      <MapContent cabins={cabins} isSingleCabin={false} showCounter={true} />
    </ClientOnly>
  )
}
