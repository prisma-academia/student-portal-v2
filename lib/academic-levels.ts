import type { CourseFormAvailability, Student } from "@/types/student";

export const FIRST_SEMESTER = "First Semester";
export const SECOND_SEMESTER = "Second Semester";
export const SEMESTERS = [FIRST_SEMESTER, SECOND_SEMESTER] as const;

/** API stores level as either 100/200/... or 1/2/...; normalise to hundreds. */
export function toLevel(raw: unknown): number {
  const n = parseInt(String(raw), 10);
  if (!n) return 100;
  return n < 100 ? n * 100 : n;
}

export type LevelStatus = "Past" | "Current" | "Upcoming";

export type SemesterCell = {
  semester: string;
  /** Whether the school has courses on this form (from the API summary). */
  available: boolean;
  courseCount: number;
};

export type LevelRow = {
  level: number;
  status: LevelStatus;
  semesters: SemesterCell[];
};

/**
 * One row per level of the student's programme, marked Past / Current /
 * Upcoming from their class level, with course-form availability merged in.
 */
export function buildLevelRows(
  user: Student | null | undefined,
  availability: CourseFormAvailability[] = [],
): LevelRow[] {
  if (!user?.classLevel || !user?.program) return [];
  const currentLevel = toLevel(user.classLevel.level);
  const duration = parseInt(String(user.program.durationInYears), 10) || 4;
  const rows: LevelRow[] = [];
  for (let i = 1; i <= duration; i++) {
    const level = i * 100;
    const status: LevelStatus =
      level < currentLevel ? "Past" : level === currentLevel ? "Current" : "Upcoming";
    rows.push({
      level,
      status,
      semesters: SEMESTERS.map((semester) => {
        const hit = availability.find(
          (a) => toLevel(a.yearId) === level && a.semester === semester,
        );
        return {
          semester,
          available: status !== "Upcoming" && Boolean(hit?.available),
          courseCount: hit?.courseCount ?? 0,
        };
      }),
    });
  }
  return rows;
}

/** "200 level" from whatever the API stored. */
export function levelLabel(raw: unknown): string {
  return `${toLevel(raw)} level`;
}
