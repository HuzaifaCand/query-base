import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface QueryAnsweredEmailProps {
  studentName: string;
  teacherName: string;
  className: string;
  queryTitle: string;
  answerPreview: string | null;
  queryUrl: string;
}

export default function QueryAnsweredEmail({
  studentName,
  teacherName,
  className,
  queryTitle,
  answerPreview,
  queryUrl,
}: QueryAnsweredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your query "{queryTitle}" has been answered by {teacherName}!
      </Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] font-sans">
          <Container className="mx-auto py-8 px-4 max-w-[600px]">
            {/* Header */}
            <Section className="bg-[#18181b] rounded-t-2xl px-8 py-6">
              <Text className="text-white text-sm font-semibold m-0">
                query<span className="text-[#2ca4ab]">base</span>
              </Text>
              <Heading className="text-white text-2xl font-bold mt-2 mb-0">
                Your Query Was Answered! 🎉
              </Heading>
            </Section>

            {/* Body */}
            <Section className="bg-white px-8 py-6">
              <Text className="text-[#3f3f46] text-base leading-relaxed">
                Hi <strong>{studentName}</strong>,
              </Text>
              <Text className="text-[#3f3f46] text-base leading-relaxed">
                Great news! Your query in <strong>{className}</strong> has just
                been answered by <strong>{teacherName}</strong>.
              </Text>

              {/* Query Card */}
              <Section className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-6 py-5 my-4">
                <Text className="text-[#71717a] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                  Your Query
                </Text>
                <Text className="text-[#18181b] text-lg font-semibold mt-0 mb-0">
                  {queryTitle}
                </Text>

                {answerPreview && (
                  <>
                    <Hr className="border-[#bbf7d0] my-4" />
                    <Text className="text-[#71717a] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                      Answer Preview
                    </Text>
                    <Text className="text-[#3f3f46] text-sm leading-relaxed mt-0 mb-0 italic">
                      "
                      {answerPreview.length > 250
                        ? answerPreview.slice(0, 250) + "..."
                        : answerPreview}
                      "
                    </Text>
                  </>
                )}

                <Hr className="border-[#bbf7d0] my-4" />

                <Text className="text-[#71717a] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                  Answered by
                </Text>
                <Text className="text-[#3f3f46] text-sm mt-0 mb-0">
                  {teacherName}
                </Text>
              </Section>

              <Text className="text-[#3f3f46] text-base">
                View the full answer.
              </Text>

              <Section className="text-center my-6">
                <Button
                  href={queryUrl}
                  className="bg-[#2ca4ab] text-white font-semibold rounded-lg px-6 py-3 text-sm no-underline inline-block"
                >
                  View Full Answer →
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f4f4f5] px-8 py-4 rounded-b-2xl text-center">
              <Text className="text-[#a1a1aa] text-xs m-0">
                You're receiving this email because you submitted a query on{" "}
                <strong>{className}</strong> querybase.
              </Text>
              <Text className="text-[#a1a1aa] text-xs m-0 mt-1">
                © {new Date().getFullYear()} querybase. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
