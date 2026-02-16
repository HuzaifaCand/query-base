import JoinComponent from "@/components/join/JoinComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join a Class | QueryBase",
};

export default function JoinPage() {
  return <JoinComponent />;
}
