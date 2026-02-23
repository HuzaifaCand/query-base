import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createApiClient } from "@/lib/server";
import QueryAnsweredEmail from "@/emails/QueryAnsweredEmail";
import { render } from "@react-email/components";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryId, answerId } = body as {
      queryId: string;
      answerId: string;
    };

    if (!queryId || !answerId) {
      return NextResponse.json(
        { error: "queryId and answerId are required" },
        { status: 400 },
      );
    }

    const supabase = await createApiClient();

    // 1. Fetch the query + student info + class info + answer info
    const [queryResult, answerResult] = await Promise.all([
      supabase
        .from("queries")
        .select(
          `
          id,
          title,
          class_id,
          is_anonymous,
          classes ( name ),
          users!queries_student_id_fkey ( full_name, email )
        `,
        )
        .eq("id", queryId)
        .single(),

      supabase
        .from("answers")
        .select(
          `
          id,
          body_text,
          users!answers_author_id_fkey ( full_name )
        `,
        )
        .eq("id", answerId)
        .single(),
    ]);

    if (queryResult.error || !queryResult.data) {
      console.error("Error fetching query:", queryResult.error);
      return NextResponse.json(
        { error: "Failed to fetch query data" },
        { status: 500 },
      );
    }

    if (answerResult.error || !answerResult.data) {
      console.error("Error fetching answer:", answerResult.error);
      return NextResponse.json(
        { error: "Failed to fetch answer data" },
        { status: 500 },
      );
    }

    const query = queryResult.data;
    const answer = answerResult.data;

    const student = query.users as {
      full_name: string | null;
      email: string;
    } | null;

    if (!student?.email) {
      return NextResponse.json(
        { message: "Student has no email, no notification sent" },
        { status: 200 },
      );
    }

    const className =
      (query.classes as { name: string } | null)?.name ?? "Your Class";
    const teacherName =
      (answer.users as { full_name: string | null } | null)?.full_name ??
      "Your teacher";
    const classId = query.class_id;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
    const queryUrl = `${appUrl}/dashboard/${classId}`;

    const html = await render(
      QueryAnsweredEmail({
        studentName: student.full_name ?? "Student",
        teacherName,
        className,
        queryTitle: query.title ?? "Your Query",
        answerPreview: answer.body_text ?? null,
        queryUrl,
      }),
    );

    await resend.emails.send({
      from: "QueryBase <notifications@querybase.app>",
      to: [student.email],
      subject: `Your query "${query.title ?? "Your Query"}" has been answered!`,
      html,
    });

    return NextResponse.json(
      { message: "Email sent to student" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in /api/notify-answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
