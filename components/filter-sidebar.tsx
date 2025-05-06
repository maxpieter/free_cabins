"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Cabin } from "@/lib/types"
import { REGIONS_BY_COUNTRY } from "@/lib/utils/regions"
import { CABIN_TYPES } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, Filter } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FilterSidebarProps {
  cabins: Cabin[]
}

/**
 * Sidebar component with filters for the cabin map
 */
export default function FilterSidebar({ cabins }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(true)

  // Get unique countries from cabins
  const countries = Array.from(new Set(cabins.map((cabin) => cabin.country))).sort()

  // Get unique regions based on selected country
  const [availableRegions, setAvailableRegions] = useState<string[]>([])

  // Get max capacity
  const maxCapacity = Math.max(...cabins.map((cabin) => cabin.capacity ?? 0))
  
  // Get current filter values from URL
  const [filters, setFilters] = useState({
    country: searchParams.get("country") || "all",
    region: searchParams.get("region") || "all",
    municipality: searchParams.get("municipality") || "all",
    capacityRange: [
      searchParams.get("minCapacity") || "1",
      searchParams.get("maxCapacity") || maxCapacity.toString(),
    ],
    hasWater: searchParams.get("hasWater") === "true",
    hasToilet: searchParams.get("hasToilet") === "true",
    hasFireplace: searchParams.get("hasFireplace") === "true",
    isFree: searchParams.get("isFree") === "true",
    requiresBooking: searchParams.get("requiresBooking") || "all",
    cabinType: searchParams.get("cabinType") || "all",
  });

  // Update available regions when country changes
  useEffect(() => {
    if (filters.country === "all") {
      // If no country is selected, show all regions from all countries
      const allRegions = Object.values(REGIONS_BY_COUNTRY).flat()
      setAvailableRegions([...new Set(allRegions)].sort())
    } else {
      // Show regions for the selected country
      setAvailableRegions(REGIONS_BY_COUNTRY[filters.country] || [])
    }
  }, [filters.country])

  // Update URL when filters change
  const updateFilters = () => {
    const params = new URLSearchParams()
    if (filters.country !== "all") params.set("country", filters.country)
    if (filters.region !== "all") params.set("region", filters.region)
    params.set("minCapacity", filters.capacityRange[0]);
    params.set("maxCapacity", filters.capacityRange[1]);
    if (filters.hasWater) params.set("hasWater", "true")
    if (filters.hasToilet) params.set("hasToilet", "true")
    if (filters.hasFireplace) params.set("hasFireplace", "true") // Added fireplace filter
    if (filters.requiresBooking !== "all") params.set("requiresBooking", filters.requiresBooking)
    if (filters.cabinType !== "all") params.set("cabinType", filters.cabinType)

    router.push(`/?${params.toString()}`)
  }

  const resetFilters = () => {
    setFilters({
      country: "all",
      region: "all",
      municipality: "all",
      capacityRange: ["1", maxCapacity.toString()],
      hasWater: false,
      hasToilet: false,
      hasFireplace: false,
      isFree: false,
      requiresBooking: "all",
      cabinType: "all",
    });
  
    router.push("/");
  };

  useEffect(() => {
    updateFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  return (
    <>
      <div
        className={`md:relative fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="bg-background border-r h-full w-80 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          <div className="space-y-6">
            {/* Country filter */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={filters.country}
                onValueChange={(value) => {
                  // When country changes, reset region to "all"
                  setFilters({ ...filters, country: value, region: "all" })
                }}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country ?? ''}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region filter - only shown if regions are available */}
            {availableRegions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Cabin type filter */}
            <div className="space-y-2">
              <Label htmlFor="cabinType">Cabin Type</Label>
              <Select value={filters.cabinType} onValueChange={(value) => setFilters({ ...filters, cabinType: value })}>
                <SelectTrigger id="cabinType">
                  <SelectValue placeholder="Select cabin type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CABIN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity filter */}
            <div className="space-y-2">
              <Label>
                Capacity Range: {filters.capacityRange[0]} - {filters.capacityRange[1]} people
              </Label>
              <Slider
                value={filters.capacityRange.map(Number)}
                min={1}
                max={maxCapacity}
                step={1}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    capacityRange: [value[0].toString(), value[1].toString()],
                    })
                }
              />
            </div>

            {/* Amenities filters */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasWater"
                  checked={filters.hasWater}
                  onCheckedChange={(checked) => setFilters({ ...filters, hasWater: checked === true })}
                />
                <Label htmlFor="hasWater" className="cursor-pointer">
                  Water
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasToilet"
                  checked={filters.hasToilet}
                  onCheckedChange={(checked) => setFilters({ ...filters, hasToilet: checked === true })}
                />
                <Label htmlFor="hasToilet" className="cursor-pointer">
                  Toilet
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasFireplace"
                  checked={filters.hasFireplace}
                  onCheckedChange={(checked) => setFilters({ ...filters, hasFireplace: checked === true })}
                />
                <Label htmlFor="hasFireplace" className="cursor-pointer">
                  Fireplace
                </Label>
              </div>
            </div>

            {/* Booking requirement filter - changed to radio buttons */}
            <div className="space-y-2">
              <Label>Booking Requirement</Label>
              <RadioGroup
                value={filters.requiresBooking}
                onValueChange={(value) => setFilters({ ...filters, requiresBooking: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="booking-all" />
                  <Label htmlFor="booking-all" className="cursor-pointer">
                    All Cabins
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="booking-required" />
                  <Label htmlFor="booking-required" className="cursor-pointer">
                    Requires Booking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="booking-not-required" />
                  <Label htmlFor="booking-not-required" className="cursor-pointer">
                    No Booking Required
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 rounded-full md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
      </Button>
    </>
  )
}
