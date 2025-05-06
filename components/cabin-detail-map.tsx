import type { Cabin } from "@/lib/types"
import ClientOnly from "./map/client-only-map"
import MapContent from "./map/map-content"

interface CabinDetailMapProps {
  cabin: Cabin
}

/**
 * Map component for displaying a single cabin detail
 */
export default function CabinDetailMap({ cabin }: CabinDetailMapProps) {
  return (
    <ClientOnly>
      <MapContent cabins={cabin} isSingleCabin={true} showCounter={false} />
    </ClientOnly>
  )
}
