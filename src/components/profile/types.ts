import type { Tables } from "@/lib/databasetypes";
import { Database } from "@/lib/databasetypes";

export type Role = "student" | "teacher" | "ta";

export interface UserProfile extends Tables<"users"> {}

export interface ClassInfo {
  id: string;
  name: string;
  subject: string | null;
  level: string | null;
}

export type StudentStats = Database["public"]["Views"]["student_stats"]["Row"];

export type TeacherStats = Database["public"]["Views"]["teacher_stats"]["Row"];
