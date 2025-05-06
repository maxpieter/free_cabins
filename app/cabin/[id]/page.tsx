import { getCabins } from "@/lib/data"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, MapPin, Users, Mail, Globe, Facebook, Instagram } from "lucide-react"
import Link from "next/link"
import CabinDetailMap from "@/components/cabin-detail-map"
import Image from "next/image"

interface CabinDetailPageProps {
  params: {
    id: string
  }
}

export default async function CabinDetailPage({ params }: CabinDetailPageProps) {
  const cabins = await getCabins()
  const cabin = cabins.find((c) => c.id === params.id)

  if (!cabin) {
    notFound()
  }

  return (
    <div className="container py-8 px-6 md:px-8">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">
          &larr; Back to map
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{cabin.name}</h1>
          <p className="text-muted-foreground mb-6">
            {cabin.country}
            {cabin.region ? `, ${cabin.region}` : ""}
          </p>

          {/* Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{cabin.latitude.toFixed(5)}, {cabin.longitude.toFixed(5)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>Capacity: {cabin.capacity} people</span>
              </div>

              {cabin.type && (
                <div>
                  <h3 className="font-medium mb-1">Type</h3>
                  <p className="capitalize">{cabin.type}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-1">Amenities</h3>
                {cabin.amenities.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {cabin.amenities.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                ) : (
                  <p>No amenities available</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-1">Booking</h3>
                <p>{cabin.requiresBooking ? "Requires booking in advance" : "No booking required"}</p>
              </div>

              {cabin.description && (
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p>{cabin.description}</p>
                </div>
              )}

              {/* Optional Links */}
              <div className="space-y-2">
                {cabin.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${cabin.email}`} className="underline text-primary">{cabin.email}</a>
                  </div>
                )}
                {cabin.phone && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${cabin.phone}`} className="underline text-primary">{cabin.phone}</a>
                  </div>
                )}
                {cabin.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href={cabin.website} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                      Visit website
                    </a>
                  </div>
                )}
                {cabin.facebook && (
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    <a href={cabin.facebook} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                      Facebook
                    </a>
                  </div>
                )}
                {cabin.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <a href={cabin.instagram} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                      Instagram
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardHeader>
              <CardTitle>Last Updated</CardTitle>
              <CardDescription>
                {new Date(cabin.lastUpdated).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

      {/* Right Column */}
      <div className="flex flex-col h-full space-y-4">
        {/* Map */}
        <div className="h-[250px] md:h-[300px] w-full">
          <CabinDetailMap cabin={cabin} />
        </div>

        {/* Images Gallery */}
        {cabin.images && cabin.images.length > 0 && (
          <div className="overflow-y-auto max-h-[300px]">
            <h2 className="text-xl font-semibold mb-2">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cabin.images.map((image) => (
                <div key={image.originalUrl} className="relative w-full h-40 rounded overflow-hidden">
                  <Image
                    src={image.originalUrl}
                    alt={image.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}