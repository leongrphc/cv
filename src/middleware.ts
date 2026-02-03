import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Routes that require authentication
const protectedRoutes = ["/history", "/profile"];

// API routes that require authentication
const protectedApiRoutes = ["/api/history", "/api/user"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  // Get session token
  const token = request.cookies.get("session")?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }
    // Redirect to login for page routes
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Invalid token - clear it and redirect
    const response = isProtectedApi
      ? NextResponse.json(
          { success: false, error: "Oturum süresi dolmuş" },
          { status: 401 }
        )
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: [
    "/history/:path*",
    "/profile/:path*",
    "/api/history/:path*",
    "/api/user/:path*",
  ],
};
