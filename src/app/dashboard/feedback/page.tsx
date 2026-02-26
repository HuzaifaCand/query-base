import FeedbackComponent from "@/components/feedback/FeedbackComponent";
import TransitionWrapper from "@/components/layout/TransitionWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback & Support | QueryBase",
  description: "Send feedback",
};

export default function FeedbackPage() {
  return (
    <TransitionWrapper>
      <FeedbackComponent role="student" />
    </TransitionWrapper>
  );
}
