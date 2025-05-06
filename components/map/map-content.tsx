"use client"

import { useEffect, useRef } from "react"
import type { Cabin } from "@/lib/types"
import { useSearchParams } from "next/navigation"

// We'll use the L namespace directly instead of importing
declare global {
  interface Window {
    L: any
  }
}

interface MapContentProps {
  cabins: Cabin[] | Cabin
  isSingleCabin?: boolean
  showCounter?: boolean
}

/**
 * A unified map component that can display either a single cabin or multiple cabins
 * @param cabins - Either a single cabin object or an array of cabins
 * @param isSingleCabin - Whether this is displaying a single cabin (detail view)
 * @param showCounter - Whether to show the cabin counter (for multiple cabins view)
 */
export default function MapContent({ cabins, isSingleCabin = false, showCounter = true }: MapContentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const searchParams = useSearchParams()

  // Get filters from URL if this is a multiple cabins view
  const filters = !isSingleCabin
  ? {
      country: searchParams.get("country") || "all",
      region: searchParams.get("region") || "all",
      minCapacity: parseInt(searchParams.get("minCapacity") || "1"),
      maxCapacity: parseInt(searchParams.get("maxCapacity") || "999"),
      hasWater: searchParams.get("hasWater") || "",
      hasToilet: searchParams.get("hasToilet") || "",
      hasFireplace: searchParams.get("hasFireplace") || "",
      hasElectricity: searchParams.get("hasElectricity") || "",
      requiresBooking: searchParams.get("requiresBooking") || "all",
      cabinType: searchParams.get("cabinType") || "all",
    }
  : null;

  // Function to filter cabins based on search params
  const filterCabins = (cabinsToFilter: Cabin[]) => {
    if (!filters) return cabinsToFilter

    return cabinsToFilter.filter((cabin) => {
      if (filters.country && filters.country !== "all" && cabin.country !== filters.country) return false
      if (filters.region && filters.region !== "all" && cabin.region !== filters.region) return false
      if ((cabin.capacity ?? 0) < filters.minCapacity || (cabin.capacity ?? 0) > filters.maxCapacity) return false      
      if (filters.hasWater === "true" && !cabin.amenities.includes("water")) return false
      if (filters.hasToilet === "true" && !cabin.amenities.includes("toilet")) return false
      if (filters.hasFireplace === "true" && !cabin.amenities.includes("fireplace")) return false
      if (filters.hasElectricity === "true" && !cabin.amenities.includes("electricity")) return false
      if (filters.requiresBooking === "true" && !cabin.requiresBooking) return false
      if (filters.requiresBooking === "false" && cabin.requiresBooking) return false
      if (filters.cabinType && filters.cabinType !== "all" && cabin.type !== filters.cabinType) return false
      return true
    })
  }

  // Initialize the map
  useEffect(() => {
    // Load Leaflet from CDN
    const loadLeaflet = async () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap()
        return
      }

      // Add Leaflet CSS if not already added
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const linkEl = document.createElement("link")
        linkEl.rel = "stylesheet"
        linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(linkEl)
      }

      // Add Leaflet JS if not already added
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const scriptEl = document.createElement("script")
        scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        scriptEl.async = true

        // Wait for script to load
        const scriptLoaded = new Promise<void>((resolve) => {
          scriptEl.onload = () => resolve()
        })

        document.head.appendChild(scriptEl)
        await scriptLoaded
      }

      initializeMap()
    }

    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current && window.L) {
        const L = window.L

        // For single cabin view, center on that cabin
        // For multiple cabins, use Europe-specific bounds
        if (isSingleCabin) {
          const cabin = cabins as Cabin
          mapInstanceRef.current = L.map(mapRef.current).setView([cabin.latitude, cabin.longitude], 12)
        } else {
          // Initialize map with Europe-specific bounds
          mapInstanceRef.current = L.map(mapRef.current)

          // Set bounds for Europe (roughly 35°N to 70°N latitude and -10°W to 40°E longitude)
          const europeBounds = [
            [35, -10], // Southwest corner
            [70, 40], // Northeast corner
          ]

          mapInstanceRef.current.fitBounds(europeBounds)
          mapInstanceRef.current.setMinZoom(3) // Prevent zooming out too far
        }

        L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          maxZoom: 17,
          attribution:
            'Map data: © <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
        }).addTo(mapInstanceRef.current);
        // Initial render of markers
        renderMarkers()
      }
    }

    loadLeaflet()

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when filters change or cabins change
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers()
    }
  }, [searchParams, cabins])

  // Function to render markers based on filtered cabins
  const renderMarkers = () => {
    const L = window.L
    if (!L || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Handle single cabin case
    if (isSingleCabin) {
      const cabin = cabins as Cabin
      const marker = L.marker([cabin.latitude, cabin.longitude]).addTo(mapInstanceRef.current)

      // Create popup content
      const popupContent = document.createElement("div")
      popupContent.innerHTML = `
        <div class="p-2">
          <h3 class="font-bold">${cabin.name}</h3>
          <p class="text-sm text-gray-500">${cabin.country}</p>
          <p class="text-sm mt-1">Capacity: ${cabin.capacity} people</p>
        </div>
      `

      marker.bindPopup(popupContent)
      markersRef.current.push(marker)
      return
    }

    // Handle multiple cabins case
    const cabinsArray = cabins as Cabin[]

    // Filter cabins if needed
    const filteredCabins = filters ? filterCabins(cabinsArray) : cabinsArray

    // Add new markers
    filteredCabins.forEach((cabin) => {
      const marker = L.marker([cabin.latitude, cabin.longitude]).addTo(mapInstanceRef.current)

      // Create popup content
      const popupContent = document.createElement("div")
      popupContent.innerHTML = `
        <div class="p-2">
          <h3 class="font-bold">${cabin.name}</h3>
          <p class="text-sm text-gray-500">${cabin.country}${cabin.region ? `, ${cabin.region}` : ""}</p>
          <p class="text-sm mt-1">Capacity: ${cabin.capacity} people</p>
          <p class="text-sm">Coordinates: ${cabin.latitude.toFixed(5)}, ${cabin.longitude.toFixed(5)}</p>
          ${cabin.amenities.length > 0 ? `<p class="text-sm">Amenities: ${cabin.amenities.join(", ")}</p>` : ""}
          ${cabin.requiresBooking ? `<p class="text-sm">Requires booking in advance</p>` : ""}
          ${cabin.type ? `<p class="text-sm">Type: ${cabin.type}</p>` : ""}
          <a href="/cabin/${cabin.id}" class="text-sm text-blue-500 hover:underline block mt-1">View details</a>
        </div>
      `

      marker.bindPopup(popupContent)
      markersRef.current.push(marker)
    })

    // Update counter if showing multiple cabins
    if (showCounter) {
      const counterEl = document.getElementById("cabin-counter")
      if (counterEl) {
        counterEl.textContent = `Showing ${filteredCabins.length} of ${cabinsArray.length} cabins`
      }
    }

    // Fit bounds if we have markers
    if (filteredCabins.length > 0) {
      const bounds = filteredCabins.map((cabin) => [cabin.latitude, cabin.longitude])
      mapInstanceRef.current.fitBounds(bounds)
    }
  }

  return (
    <div className="flex-1 relative">
      {showCounter && !isSingleCabin && (
        <div className="absolute top-4 right-4 z-[1000] bg-background/80 backdrop-blur-sm p-3 rounded-md border">
          <p id="cabin-counter" className="text-sm font-medium">
            Loading cabins...
          </p>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full z-0 relative"></div>
    </div>
  )
}
