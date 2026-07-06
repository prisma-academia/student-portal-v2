import type { Student } from "@/types/student";

export const FIRST_SEMESTER = "First Semester";
export const SECOND_SEMESTER = "Second Semester";

export type ClassRow = {
  id: string;
  classLabel: string;
  status: string;
  firstSemester: string;
  secondSemester: string;
};

export function buildClassRows(user: Student | null): ClassRow[] {
  if (!user?.classLevel || !user?.program) return [];
  const currentLevel = parseInt(String(user.classLevel.level), 10) || 100;
  const programDuration =
    parseInt(String(user.program.durationInYears), 10) || 4;
  const levels: ClassRow[] = [];
  for (let i = 1; i <= programDuration; i++) {
    const level = i * 100;
    let status = "Upcoming";
    let firstSemester = "Upcoming";
    let secondSemester = "Upcoming";
    if (level < currentLevel) {
      status = "Past";
      firstSemester = "Completed";
      secondSemester = "Completed";
    } else if (level === currentLevel) {
      status = "Current";
      firstSemester = "Ongoing";
      secondSemester = "Upcoming";
    }
    levels.push({
      id: level.toString(),
      classLabel: `${level}`,
      status,
      firstSemester,
      secondSemester,
    });
  }
  return levels;
}

/** Result tab rows (includes academic year label) */
export type ResultRow = ClassRow & { year: string };

export function buildResultRows(user: Student | null): ResultRow[] {
  if (!user?.classLevel || !user?.program) return [];
  const currentLevel = parseInt(String(user.classLevel.level), 10) || 100;
  const programDuration =
    parseInt(String(user.program.durationInYears), 10) || 4;
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - (Math.floor(currentLevel / 100) - 1);
  const rows: ResultRow[] = [];
  for (let i = 1; i <= programDuration; i++) {
    const level = i * 100;
    const yearStart = startYear + (i - 1);
    const yearEnd = yearStart + 1;
    const academicYear = `${yearStart}/${yearEnd}`;
    let status = "Upcoming";
    let firstSemester = "Upcoming";
    let secondSemester = "Upcoming";
    if (level < currentLevel) {
      status = "Completed";
      firstSemester = "Available";
      secondSemester = "Available";
    } else if (level === currentLevel) {
      status = "Active";
      firstSemester = "Available";
      secondSemester = "Unavailable";
    }
    rows.push({
      id: level.toString(),
      classLabel: `${level} Level`,
      year: academicYear,
      status,
      firstSemester,
      secondSemester,
    });
  }
  return rows;
}
