import FeedbackComponent from "@/components/feedback/FeedbackComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback & Support | QueryBase",
  description: "Send feedback",
};

export default function FeedbackPage() {
  return <FeedbackComponent role="student" />;
}
