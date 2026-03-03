import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Helper function to safely decode JWTs in the Next.js Edge Runtime
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(base64 + padding));
  } catch (e) {
    return {};
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

  const path = request.nextUrl.pathname;

  // 1. Unauthenticated Guard
  if (!user && path !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated Guard
  if (user && session) {
    if (path === "/login")
      return NextResponse.redirect(new URL("/", request.url));

    // Decode the raw JWT to get our custom root claims
    const jwtPayload = decodeJwt(session.access_token);

    console.log("RAW JWT ROLE:", jwtPayload.user_role);
    console.log("RAW JWT ENROLLED:", jwtPayload.is_enrolled);

    const role = jwtPayload.user_role || "student";
    const isEnrolled = jwtPayload.is_enrolled || false;

    // Role-based Access Control (RBAC)
    const isTeacher = role === "ta" || role === "teacher";

    if (path.startsWith("/teacher") && !isTeacher) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      (path.startsWith("/dashboard") || path.startsWith("/join")) &&
      isTeacher
    ) {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }

    // Logic for Root or Join path
    if (path === "/" || path === "/join") {
      if (isTeacher)
        return NextResponse.redirect(new URL("/teacher", request.url));

      if (isEnrolled && path === "/join") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (!isEnrolled && path === "/") {
        return NextResponse.redirect(new URL("/join", request.url));
      }

      if (isEnrolled && path === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/teacher/:path*", "/dashboard/:path*", "/join"],
};
