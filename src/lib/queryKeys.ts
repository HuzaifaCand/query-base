/**
 * Centralized TanStack Query key factory.
 *
 * Hierarchy:
 *   ['queries']                                → base (invalidates everything)
 *   ['queries', 'all', classId]                → All Queries tab
 *   ['queries', 'student', classId, userId]    → Your Queries tab (student)
 *   ['queries', 'answered', classId, userId]   → Your Answers tab (teacher)
 */
export const queryKeys = {
  /** Base key – invalidating this wipes every queries-related cache. */
  all: ["queries"] as const,

  /** All queries for a specific class. */
  allQueries: (classId: string) => ["queries", "all", classId] as const,

  /** Queries created by a specific student in a class. */
  studentQueries: (classId: string, userId: string) =>
    ["queries", "student", classId, userId] as const,

  /** Queries that a specific teacher has answered in a class. */
  answeredQueries: (classId: string, userId: string) =>
    ["queries", "answered", classId, userId] as const,
};
