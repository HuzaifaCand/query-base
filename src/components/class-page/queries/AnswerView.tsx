"use client";

import { CheckCircle2 } from "lucide-react";
import { Database } from "@/lib/databasetypes";
import { AttachmentList } from "./AttachmentList";
import { UserHeader } from "./UserHeader";

type Answer = Database["public"]["Tables"]["answers"]["Row"] & {
  author: Database["public"]["Tables"]["users"]["Row"] | null;
  attachments: Database["public"]["Tables"]["attachments"]["Row"][];
};

interface AnswerViewProps {
  answer: Answer;
}

export function AnswerView({ answer }: AnswerViewProps) {
  return (
    <div className="bg-ring/5 rounded-xl p-4 sm:p-5 border border-ring/10">
      <div className="flex flex-col gap-3">
        {/* Answer header */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ring tracking-wider uppercase mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Official Answer</span>
          </div>
          <UserHeader
            name={answer.author?.full_name || "Teacher"}
            createdAt={answer.created_at}
            role="teacher"
            size="sm"
            isOfficial={!!answer.is_official}
          />
        </div>

        {/* Answer body */}
        <div className="pl-[2.25rem]">
          {" "}
          {/* Indent body to align with name/avatar slightly */}
          {answer.body_text && (
            <p className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {answer.body_text}
            </p>
          )}
          <div className="mt-3">
            <AttachmentList attachments={answer.attachments} />
          </div>
        </div>
      </div>
    </div>
  );
}
