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
  state?: string;
  lga?: string;
};

export type GuardianInfo = {
  guardianName?: string;
  guardianPhone?: string;
  relationship?: string;
};

export type Program = {
  _id?: string;
  name?: string;
  durationInYears?: number;
};

export type ClassLevel = {
  _id?: string;
  name?: string;
  /** Stored as 100/200/... on some tenants and 1/2/... on others. */
  level?: number;
  set?: number;
};

export type Student = {
  _id?: string;
  regNumber?: string;
  email?: string;
  picture?: string;
  personalInfo?: PersonalInfo;
  contactInfo?: ContactInfo;
  guardianInfo?: GuardianInfo;
  program?: Program;
  classLevel?: ClassLevel;
  enrollmentDate?: string;
  status?: string;
};

export type Memo = {
  _id: string;
  name: string;
  createdAt?: string;
  isPublic?: boolean;
  content?: string;
  createdBy?: { firstName?: string; lastName?: string; name?: string } | string;
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

export type FeePayment = {
  _id?: string;
  amount?: number;
  status?: string;
  reference?: string;
  gateway?: string;
  createdAt?: string;
};

export type Fee = {
  _id: string;
  name?: string;
  description?: string;
  amount?: number;
  dueDate?: string;
  feeType?: string;
  semester?: string | null;
  /** Active | Overdue | ... */
  status?: string;
  session?: { _id?: string; name?: string; code?: string } | null;
  items?: FeeItem[];
  isPaid?: boolean;
  userPayment?: FeePayment | null;
};

/** GET /student/me/events (raw calendar event). */
export type SchoolEvent = {
  _id: string;
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  category?: string;
  url?: string;
};

/** GET /student/me/course-form-summary */
export type CourseFormAvailability = {
  yearId: string;
  semester: string;
  available: boolean;
  courseCount: number;
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
