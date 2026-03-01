import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/server";
import NewQueryEmail from "../../../emails/NewQueryEmail";
import { render } from "@react-email/components";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryId, classId } = body as {
      queryId: string;
      classId: string;
    };

    if (!queryId || !classId) {
      return NextResponse.json(
        { error: "queryId and classId are required" },
        { status: 400 },
      );
    }

    // Use service-role client — this route runs with no user session cookie
    // (fire-and-forget fetch from the browser), so the publishable key +
    // RLS would block every query.
    const supabase = createServiceClient();

    // 1. Fetch the query + the student who submitted it + the class name
    const [queryResult, teachersResult] = await Promise.all([
      supabase
        .from("queries")
        .select(
          `
          id,
          title,
          description,
          is_anonymous,
          class_id,
          classes ( name ),
          users!queries_student_id_fkey ( full_name )
        `,
        )
        .eq("id", queryId)
        .single(),

      // 2. Fetch all teachers for this class with their email from users table
      supabase
        .from("class_teachers")
        .select(
          `
          teacher_id,
          users!class_teachers_teacher_id_fkey ( full_name, email )
        `,
        )
        .eq("class_id", classId),
    ]);

    if (queryResult.error || !queryResult.data) {
      console.error("Error fetching query:", queryResult.error);
      return NextResponse.json(
        { error: "Failed to fetch query data" },
        { status: 500 },
      );
    }

    if (teachersResult.error || !teachersResult.data) {
      console.error("Error fetching teachers:", teachersResult.error);
      return NextResponse.json(
        { error: "Failed to fetch teachers" },
        { status: 500 },
      );
    }

    const query = queryResult.data;
    const teachers = teachersResult.data;

    if (teachers.length === 0) {
      return NextResponse.json(
        { message: "No teachers found for this class, no emails sent" },
        { status: 200 },
      );
    }

    const className =
      (query.classes as { name: string } | null)?.name ?? "Your Class";

    // Use "Anonymous" when the student opted out of identity exposure
    const studentName = query.is_anonymous
      ? "A student"
      : ((query.users as { full_name: string | null } | null)?.full_name ??
        "A student");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
    const queryUrl = `${appUrl}/teacher/${classId}?tab=queries&query=${queryId}`;

    type TeacherRow = {
      teacher_id: string;
      users: { full_name: string | null; email: string } | null;
    };

    // 3. Send an email to each teacher, collecting any send errors
    const results = await Promise.allSettled(
      (teachers as TeacherRow[])
        .filter((row) => !!row.users?.email)
        .map(async (teacherRow) => {
          const teacher = teacherRow.users!;

          const html = await render(
            NewQueryEmail({
              teacherName: teacher.full_name ?? "Teacher",
              studentName,
              className,
              queryTitle: query.title ?? "Untitled Query",
              queryDescription: query.description ?? null,
              queryUrl,
            }),
          );

          const { error: sendError } = await resend.emails.send({
            from: "QueryBase <querybase@oneilm.org>",
            to: [teacher.email],
            subject: `New query in ${className}: ${query.title ?? "Untitled Query"}`,
            html,
          });

          if (sendError) {
            throw new Error(
              `Resend error for ${teacher.email}: ${sendError.message}`,
            );
          }

          return teacher.email;
        }),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      failures.forEach((f) =>
        console.error(
          "Email send failure:",
          (f as PromiseRejectedResult).reason,
        ),
      );
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json(
      {
        message: `Emails sent to ${sent} teacher(s)`,
        failures: failures.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in /api/notify-new-query:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
