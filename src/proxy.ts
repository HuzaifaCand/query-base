import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request }); // Initialize with request

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value); // Sync to request
          response = NextResponse.next({ request }); // Update response
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 1. Unauthenticated Guard
  if (!user && path !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated Guard
  if (user) {
    if (path === "/login")
      return NextResponse.redirect(new URL("/", request.url));

    // FETCH DATA (Ideally replace with JWT claims to save 100-300ms)
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = userData?.role || "student";

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

      // Check enrollment only for students
      const { data: classData } = await supabase
        .from("class_students")
        .select("id")
        .eq("student_id", user.id)
        .maybeSingle();

      if (classData && path === "/join")
        return NextResponse.redirect(new URL("/dashboard", request.url));
      if (!classData && path === "/")
        return NextResponse.redirect(new URL("/join", request.url));
      if (classData && path === "/")
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/teacher/:path*", "/dashboard/:path*", "/join"],
};
