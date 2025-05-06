import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { query } from "@/lib/db";

// Simple in-memory cache for admin users to reduce database calls
const ADMIN_CACHE: Record<string, boolean> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a user is an admin
 * @param userId The user ID to check
 * @returns Boolean indicating if the user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  // Check cache first
  if (ADMIN_CACHE[userId] !== undefined) {
    return ADMIN_CACHE[userId];
  }

  // Check database
  const results = await query("SELECT * FROM admin_users WHERE username = ?", [
    userId,
  ]);
  const isAdminUser = (results as any[]).length > 0;

  // Update cache
  ADMIN_CACHE[userId] = isAdminUser;

  // Set cache expiry
  setTimeout(() => {
    delete ADMIN_CACHE[userId];
  }, CACHE_TTL);

  return isAdminUser;
}

/**
 * Add a user to the admin list
 * @param userId The user ID to add as admin
 */
export async function addAdmin(userId: string): Promise<void> {
  await query("INSERT IGNORE INTO admin_users (username) VALUES (?)", [userId]);
  ADMIN_CACHE[userId] = true;
}

/**
 * Remove a user from the admin list
 * @param userId The user ID to remove from admin
 */
export async function removeAdmin(userId: string): Promise<void> {
  await query("DELETE FROM admin_users WHERE username = ?", [userId]);
  ADMIN_CACHE[userId] = false;
}

/**
 * Middleware to protect admin routes
 * @param request The incoming request
 * @returns NextResponse with redirect if not authenticated
 */
export async function authMiddleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // If no session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify session (in a real app, you'd decode and verify a JWT)
    const userId = session;

    // For admin routes, check if user is admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const userIsAdmin = await isAdmin(userId);

      if (!userIsAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If session is invalid, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
