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

interface NewQueryEmailProps {
  teacherName: string;
  studentName: string;
  className: string;
  queryTitle: string;
  queryDescription: string | null;
  queryUrl: string;
}

export default function NewQueryEmail({
  teacherName,
  studentName,
  className,
  queryTitle,
  queryDescription,
  queryUrl,
}: NewQueryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New query in {className}: {queryTitle}
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
                New Student Query
              </Heading>
            </Section>

            {/* Body */}
            <Section className="bg-white px-8 py-6">
              <Text className="text-[#3f3f46] text-base leading-relaxed">
                Hi <strong>{teacherName}</strong>,
              </Text>
              <Text className="text-[#3f3f46] text-base leading-relaxed">
                {studentName} has submitted a new query in your class{" "}
                <strong>{className}</strong>. Here's a quick summary:
              </Text>

              {/* Query Card */}
              <Section className="bg-[#f9f9fb] border border-[#e4e4e7] rounded-xl px-6 py-5 my-4">
                <Text className="text-[#71717a] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                  Query Title
                </Text>
                <Text className="text-[#18181b] text-lg font-semibold mt-0 mb-0">
                  {queryTitle}
                </Text>

                {queryDescription && (
                  <>
                    <Hr className="border-[#e4e4e7] my-4" />
                    <Text className="text-[#71717a] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                      Description
                    </Text>
                    <Text className="text-[#3f3f46] text-sm leading-relaxed mt-0 line-clamp-4">
                      {queryDescription.length > 300
                        ? queryDescription.slice(0, 300) + "..."
                        : queryDescription}
                    </Text>
                  </>
                )}

                <Hr className="border-[#e4e4e7] my-4" />

                <Text className="text-[#71717a] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                  Submitted by
                </Text>
                <Text className="text-[#3f3f46] text-sm mt-0 mb-0">
                  {studentName}
                </Text>
              </Section>

              <Text className="text-[#3f3f46] text-base">
                Head over to querybase to review and answer this query at your
                earliest convenience.
              </Text>

              <Section className="text-center my-6">
                <Button
                  href={queryUrl}
                  className="bg-[#2ca4ab] text-white font-semibold rounded-lg px-6 py-3 text-sm no-underline inline-block"
                >
                  View & Answer Query →
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f4f4f5] px-8 py-4 rounded-b-2xl text-center">
              <Text className="text-[#a1a1aa] text-xs m-0">
                You're receiving this email because you're a teacher on{" "}
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
