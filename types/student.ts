export type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
};

export type ContactInfo = {
  phone?: string;
  email?: string;
  address?: string;
};

export type Program = {
  name?: string;
  durationInYears?: number;
};

export type ClassLevel = {
  level?: number;
};

export type Student = {
  _id?: string;
  regNumber?: string;
  email?: string;
  picture?: string;
  personalInfo?: PersonalInfo;
  contactInfo?: ContactInfo;
  program?: Program;
  classLevel?: ClassLevel;
  enrollmentDate?: string;
};

export type Memo = {
  _id: string;
  name: string;
  createdAt?: string;
  isPublic?: boolean;
  content?: string;
  createdBy?: { name?: string };
  programs?: { name?: string }[];
  classLevels?: { name?: string }[];
};

export type StudentDocument = {
  _id: string;
  title: string;
  file: string;
  size?: number;
  isPublic?: boolean;
  course?: { code?: string };
};

export type FeeItem = { name?: string; quantity?: number; price?: number };

export type Fee = {
  _id: string;
  name?: string;
  amount?: number;
  dueDate?: string;
  items?: FeeItem[];
  isPaid?: boolean;
  userPayment?: { _id?: string };
};

export type CalendarEventInput = {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  extendedProps?: Record<string, unknown>;
  [key: string]: unknown;
};

/** One graded course in a sitting (GET /student/me/results-summary). */
export type ResultCourse = {
  resultId: string;
  courseId: string;
  code: string;
  name: string;
  credit: number;
  score: number;
  grade: string;
  gradePoint: number;
  isPass: boolean;
  remark?: string;
  attempt: number;
  isCarryOver: boolean;
  status: string;
};

export type GradeClass = { name: string; isPass: boolean };

/** A session + semester with its courses, GPA and running CGPA. */
export type ResultSitting = {
  session: { id: string; name: string; code?: string } | null;
  semester: string;
  classLevel: { id: string; name: string; level: number } | null;
  courses: ResultCourse[];
  gpa: number | null;
  totalCredits: number;
  cgpa: number | null;
  classification: GradeClass | null;
};

export type GradingSchemeSummary = {
  name: string;
  code: string;
  maxPoint: number;
  passMark: number | null;
  gpaDecimals?: number;
  bands: { grade: string; minScore: number; maxScore: number; point: number; remark?: string; isPass: boolean }[];
  classes: { name: string; minGpa: number; maxGpa: number; isPass: boolean }[];
};

/** Published academic record of the signed-in student. */
export type AcademicSummary = {
  gradingScheme: GradingSchemeSummary | null;
  semesters: ResultSitting[];
  cgpa: number | null;
  totalCredits: number;
  creditsEarned: number;
  classification: GradeClass | null;
  outstanding: { courseId: string; code: string; name: string; credit: number; semester: string; attempts: number }[];
};
