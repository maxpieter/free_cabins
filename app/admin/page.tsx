

import { getCabins } from "@/lib/data"
import AdminCabinList from "@/components/admin-cabin-list"
import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminPage() {
  const session = (await cookies()).get("session")?.value;
    if (!session || !(await isAdmin(session))) {
    redirect("/unauthorized")
  }
  const cabins = await getCabins()

  return (
    <div className="container py-8 px-6 md:px-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-8 text-muted-foreground">
        Manage the free cabins and shelters database. Add new cabins, edit existing ones, or remove outdated entries.
      </p>

      <AdminCabinList cabins={cabins} />
    </div>
  )
}
