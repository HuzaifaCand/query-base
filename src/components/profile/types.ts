import type { Tables } from "@/lib/databasetypes";

export type Role = "student" | "teacher" | "ta";

export interface UserProfile extends Tables<"users"> {}

export interface ClassInfo {
  id: string;
  name: string;
  subject: string | null;
  level: string | null;
}

export interface StudentStats {
  queries_asked: number | null;
  answers_received: number | null;
}

export interface TeacherStats {
  queries_resolved: number | null;
  total_unique_students: number | null;
}
