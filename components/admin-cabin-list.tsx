"use client"

import type React from "react"
import { CABIN_TYPES } from "@/lib/types";
import { useState, useRef } from "react"
import type { Cabin } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash2, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AdminCabinListProps {
  cabins: Cabin[]
}

export default function AdminCabinList({ cabins }: AdminCabinListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null)
  const [formData, setFormData] = useState<Partial<Cabin>>({
    name: "",
    country: "",
    region: "",
    municipality: "",
    latitude: 0,
    longitude: 0,
    altitude: null,
    capacity: null,
    amenities: [],
    isFree: false,
    requiresBooking: false,
    email: "",
    phone: "",
    website: "",
    facebook: "",
    instagram: "",
    description: "",
    images: [],
  })

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "latitude" ||
        name === "longitude" ||
        name === "altitude" ||
        name === "capacity"
          ? Number.parseFloat(value)
          : value,
    })
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name === "requiresBooking") {
      setFormData({
        ...formData,
        requiresBooking: checked,
      })
    } else if (name === "hasWater" || name === "hasToilet") {
      const amenity = name === "hasWater" ? "water" : "toilet"
      const currentAmenities = formData.amenities || []

      setFormData({
        ...formData,
        amenities: checked ? [...currentAmenities, amenity] : currentAmenities.filter((a) => a !== amenity),
      })
    }
  }
  
  const addImage = () => {
    const updatedImages = [...(formData.images || []), {
      id: 0,
      name: "",
      fileName: "",
      mimeType: "",
      originalUrl: "",
      previewUrl: "",
    }];
    setFormData({ ...formData, images: updatedImages });
  };
  
  const removeImage = (index: number) => {
    const updatedImages = [...(formData.images || [])];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      country: "",
      region: "",
      municipality: "",
      latitude: 0,
      longitude: 0,
      altitude: null,
      capacity: null,
      type: "",
      amenities: [],
      isFree: false,
      requiresBooking: false,
      email: "",
      phone: "",
      website: "",
      facebook: "",
      instagram: "",
      description: "",
      images: [],
    })
  }

  const handleAddCabin = async () => {
    try {
      const response = await fetch("/api/routes/cabins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        resetForm()
        router.refresh()
      } else {
        console.error("Failed to add cabin")
      }
    } catch (error) {
      console.error("Error adding cabin:", error)
    }
  }

  const handleEditCabin = async () => {
    if (!selectedCabin) return

    try {
      const response = await fetch(`/api/routes/cabins/${selectedCabin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setSelectedCabin(null)
        resetForm()
        router.refresh()
      } else {
        console.error("Failed to update cabin")
      }
    } catch (error) {
      console.error("Error updating cabin:", error)
    }
  }

  const handleDeleteCabin = async () => {
    if (!selectedCabin) return

    try {
      const response = await fetch(`/api/routes/cabins/${selectedCabin.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedCabin(null)
        router.refresh()
      } else {
        console.error("Failed to delete cabin")
      }
    } catch (error) {
      console.error("Error deleting cabin:", error)
    }
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (!Array.isArray(json)) {
          throw new Error("JSON must be an array of cabins.");
        }

        const response = await fetch("/api/import/bulk_json/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });

        if (!response.ok) {
          throw new Error("Bulk upload failed.");
        }

        toast({
          title: "Bulk Upload Successful",
          description: "Cabins have been imported.",
        });

        router.refresh();
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "An error occurred while uploading.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  }

  const handleImportCAI = async () => {
    setIsImporting(true)

    try {
      const response = await fetch("/api/import/cai", {
        method: "POST",
      })

      const contentType = response.headers.get("content-type");
      let data
      try {
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text.slice(0, 100)}`);
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        throw new Error("Failed to parse API response")
      }

      if (response.ok) {
        toast({
          title: "Import Successful",
          description: data.message,
          variant: data.usedMockData ? "default" : "default",
        })
        router.refresh()
      } else {
        toast({
          title: "Import Failed",
          description: data.error || "Failed to import CAI refuges",
          variant: "destructive",
        })
        console.error("Import failed details:", data.details)
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: `An error occurred: ${(error as Error).message}`,
        variant: "destructive",
      })
      console.error("Error importing CAI refuges:", error)
    } finally {
      setIsImporting(false)
    }
  }

  const openEditDialog = (cabin: Cabin) => {
    setSelectedCabin(cabin)
    setFormData({
      name: cabin.name,
      country: cabin.country,
      region: cabin.region || "",
      municipality: cabin.municipality || "",
      latitude: cabin.latitude,
      longitude: cabin.longitude,
      altitude: cabin.altitude,
      capacity: cabin.capacity,
      type: cabin.type,
      amenities: cabin.amenities || [],
      isFree: cabin.isFree,
      requiresBooking: cabin.requiresBooking,
      email: cabin.email || "",
      phone: cabin.phone || "",
      website: cabin.website || "",
      facebook: cabin.facebook || "",
      instagram: cabin.instagram || "",
      description: cabin.description || "",
      images: cabin.images || [],
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (cabin: Cabin) => {
    setSelectedCabin(cabin)
    setIsDeleteDialogOpen(true)
  }

  // Count CAI cabins
  const caiCabinCount = cabins.filter((cabin) => cabin.id.startsWith("cai-")).length

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cabin Database</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleImportCAI} disabled={isImporting}>
            <Download className="h-4 w-4" />
            {isImporting ? "Importing..." : `Import CAI Refuges ${caiCabinCount > 0 ? `(${caiCabinCount})` : ""}`}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleFileClick}
          >
            <Download className="h-4 w-4" />
            Bulk import cabins
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add New Cabin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Cabin</DialogTitle>
                <DialogDescription>Add a new hut or shelter to the database.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity ?? ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description ?? ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amenities</Label>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasWater"
                        checked={formData.amenities?.includes("water")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasWater", checked === true)
                        }
                      />
                      <Label htmlFor="hasWater" className="cursor-pointer">
                        Water
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasToilet"
                        checked={formData.amenities?.includes("toilet")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasToilet", checked === true)
                        }
                      />
                      <Label htmlFor="hasToilet" className="cursor-pointer">
                        Toilet
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasElectricity"
                        checked={formData.amenities?.includes("electricity")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasElectricity", checked === true)
                        }
                      />
                      <Label htmlFor="hasElectricity" className="cursor-pointer">
                        Electricity
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasBlankets"
                        checked={formData.amenities?.includes("blankets")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasBlankets", checked === true)
                        }
                      />
                      <Label htmlFor="hasBlankets" className="cursor-pointer">
                        Blankets
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasFireplace"
                        checked={formData.amenities?.includes("fireplace")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasFireplace", checked === true)
                        }
                      />
                      <Label htmlFor="hasFireplace" className="cursor-pointer">
                        Fireplace
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasFood"
                        checked={formData.amenities?.includes("food and beverages")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasFood", checked === true)
                        }
                      />
                      <Label htmlFor="hasFood" className="cursor-pointer">
                        Food and Beverages
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasInternet"
                        checked={formData.amenities?.includes("internet")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("hasInternet", checked === true)
                        }
                      />
                      <Label htmlFor="hasInternet" className="cursor-pointer">
                        Internet
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Booking</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFree"
                        checked={formData.isFree}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isFree", checked === true)
                        }
                      />
                      <Label htmlFor="isFree" className="cursor-pointer">
                        Free to use
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresBooking"
                        checked={formData.requiresBooking}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("requiresBooking", checked === true)
                        }
                      />
                      <Label htmlFor="requiresBooking" className="cursor-pointer">
                        Requires Booking
                      </Label>
                    </div>
                    <div className="space-y-2">
                    <Label>Type</Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type || ""}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 text-sm bg-background"
                      >
                        <option value="">Select a type</option>
                        {CABIN_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <Input
                  id="email"
                  name="email"
                  placeholder="Email (optional)"
                  value={formData.email ?? ''}
                  onChange={handleInputChange}
                />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={formData.phone ?? ''}
                  onChange={handleInputChange}
                />
                <Input
                  id="website"
                  name="website"
                  placeholder="Website (optional)"
                  value={formData.website ?? ''}
                  onChange={handleInputChange}
                />
                <Input
                  id="facebook"
                  name="facebook"
                  placeholder="Facebook (optional)"
                  value={formData.facebook ?? ''}
                  onChange={handleInputChange}
                />
                </div>
                {/* Cabin Images */}
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>Images</Label>
                {formData.images?.map((image, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-md">
                    <Input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          const updatedImage = {
                            ...image,
                            name: file.name,
                            fileName: file.name,
                            mimeType: file.type,
                            originalUrl: base64,
                            previewUrl: base64,
                          };
                          const updatedImages = [...(formData.images || [])];
                          updatedImages[index] = updatedImage;
                          setFormData({ ...formData, images: updatedImages });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    {image.previewUrl && (
                      <div className="mt-2">
                        <img
                          src={image.previewUrl}
                          alt={image.name}
                          className="max-h-40 rounded border"
                        />
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                  className="mt-2"
                >
                  + Add Image
                </Button>
              </div>
              </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCabin}>Add Cabin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Free</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cabins.map((cabin) => (
                <TableRow key={cabin.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`/cabin/${cabin.id}`}
                      className="text-primary hover:underline"
                    >
                      {cabin.name}
                    </a>
                  </TableCell>
                  <TableCell>{cabin.country}</TableCell>
                  <TableCell>{cabin.capacity}</TableCell>
                  <TableCell>{cabin.amenities.join(", ") || "None"}</TableCell>
                  <TableCell>{cabin.type || "–"}</TableCell>
                  <TableCell>
                    {cabin.requiresBooking ? "Required" : "Not required"}
                  </TableCell>
                  <TableCell>{cabin.isFree ? "Yes" : "No"}</TableCell>

                  {/* Missing actions column! Add this: */}
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(cabin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(cabin)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cabin</DialogTitle>
            <DialogDescription>Update the cabin information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div> */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  name="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  name="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity ?? ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                value={formData.type || ""}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              >
                <option value="">Select a type</option>
                <option value="unattended hut">Unattended Hut</option>
                <option value="shelter">Shelter</option>
                <option value="manned hut">Manned Hut</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-hasWater"
                  checked={formData.amenities?.includes("water")}
                  onCheckedChange={(checked) => handleCheckboxChange("hasWater", checked === true)}
                />
                <Label htmlFor="edit-hasWater" className="cursor-pointer">
                  Water
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-hasToilet"
                  checked={formData.amenities?.includes("toilet")}
                  onCheckedChange={(checked) => handleCheckboxChange("hasToilet", checked === true)}
                />
                <Label htmlFor="edit-hasToilet" className="cursor-pointer">
                  Toilet
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-hasFireplace"
                  checked={formData.amenities?.includes("fireplace")}
                  onCheckedChange={(checked) => handleCheckboxChange("hasFireplace", checked === true)}
                />
                <Label htmlFor="edit-hasFireplace" className="cursor-pointer">
                  Fireplace
                </Label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-requiresBooking"
                checked={formData.requiresBooking}
                onCheckedChange={(checked) => handleCheckboxChange("requiresBooking", checked === true)}
              />
              <Label htmlFor="edit-requiresBooking" className="cursor-pointer">
                Requires Booking
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website (optional)</Label>
              <Input id="edit-website" name="website" value={formData.website ?? ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description ?? ''}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCabin}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cabin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cabin? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCabin}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
