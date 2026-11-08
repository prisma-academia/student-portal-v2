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

/** A session as fees and statements carry it. */
export type SessionRef = {
  _id?: string | null;
  name?: string;
  code?: string;
  isCurrent?: boolean;
  startDate?: string;
};

export type Fee = {
  _id: string;
  name?: string;
  description?: string;
  amount?: number;
  dueDate?: string;
  /** School fees, Hostel, ..., and 'Resit' for generated resit fees. */
  feeType?: string;
  semester?: string | null;
  /** Active | Overdue | ... */
  status?: string;
  session?: SessionRef | null;
  items?: FeeItem[];
  isPaid?: boolean;
  userPayment?: FeePayment | null;
  /** Statement only: unpaid and past its due date. */
  isOverdue?: boolean;
  /** Statement only: unpaid fee from a session before the current one. */
  isArrears?: boolean;
};

/** Where the student was placed in a session (programme + class level). */
export type FeePlacement = {
  program: { _id?: string; name?: string; code?: string } | null;
  classLevel: { _id?: string; name?: string } | null;
};

export type FeeTotals = { expected: number; paid: number; outstanding: number; arrears: number };

export type FeeSessionTotals = {
  session: SessionRef;
  placement: FeePlacement | null;
  expected: number;
  paid: number;
  outstanding: number;
};

export type StudentEnrollment = {
  _id?: string;
  session: { _id?: string; name?: string; isCurrent?: boolean } | null;
  program: { _id?: string; name?: string; code?: string } | null;
  classLevel: { _id?: string; name?: string } | null;
  source?: string;
  updatedAt?: string;
};

/** GET /student/me/fees?session=all|<id>: fees across sessions with totals. */
export type FeeStatement = {
  fees: Fee[];
  enrollments: StudentEnrollment[];
  summary: {
    totals: FeeTotals;
    byFeeType: { feeType: string; expected: number; paid: number; outstanding: number; unpaidCount: number }[];
    /** Newest session first; fees with no session last. */
    bySession: FeeSessionTotals[];
  };
  /** True when the API answered with the older plain array (no per-session data). */
  legacy?: boolean;
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
  /** The score is a resit score (only the latest score is shown). */
  isResit?: boolean;
  status: string;
};

export type ExamOutcomeStatus = "pass" | "pass_co" | "fail";

/** Exam outcome of a sitting (or a whole session, by the scheme's scope). */
export type ExamOutcome = {
  status: ExamOutcomeStatus;
  label: string;
  scope: "semester" | "session";
  failedCount: number;
  threshold: number;
  courseCount: number;
  /** Course codes. */
  failedCourses: string[];
  /** The school's message, only when the status is fail. */
  message?: string;
  provisional?: boolean;
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
  /** Null when the outcome rule is off, or while results are still to be published. */
  outcome?: ExamOutcome | null;
  /** Some results of this sitting (or session) are not published yet. */
  outcomePending?: boolean;
};

export type GradingSchemeSummary = {
  name: string;
  code: string;
  maxPoint: number;
  passMark: number | null;
  gpaDecimals?: number;
  bands: { grade: string; minScore: number; maxScore: number; point: number; remark?: string; isPass: boolean }[];
  classes: { name: string; minGpa: number; maxGpa: number; isPass: boolean }[];
  examOutcome?: { enabled: boolean; scope: "semester" | "session"; failThreshold: number };
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
  /** The newest sitting's exam outcome, if any. */
  latestOutcome?: ExamOutcome | null;
};

/** paid (completed payment) · waived · pending_payment · cancelled. Derived by the API. */
export type ResitState = "paid" | "waived" | "pending_payment" | "cancelled";

export type ResitCourseRef = {
  _id: string;
  code?: string;
  name?: string;
  credit?: number;
  semester?: string;
};

/** A failed course the student hasn't passed since (GET /student/me/resits). */
export type ResitCourse = {
  resultId: string;
  course: ResitCourseRef | null;
  session: { _id: string; name?: string } | null;
  semester?: string;
  score?: number;
  grade?: string;
  attempt?: number;
  /** Resit price for the current session; null when the school hasn't set one. */
  price: number | null;
  canRegister: boolean;
  registration: { _id: string; state: ResitState; fee: string; paymentStarted?: boolean } | null;
};

export type ResitRegistration = {
  _id: string;
  session: { _id?: string; name?: string } | string | null;
  courses: {
    course: ResitCourseRef | string | null;
    result?: string;
    amount: number;
    /** A resit score was recorded with this entry. */
    used: boolean;
    usedAt: string | null;
  }[];
  total: number;
  /** The fee to pay with POST /payment/initialize. */
  fee: string;
  status: "active" | "waived" | "cancelled";
  state: ResitState;
  entitled: boolean;
  paymentStarted?: boolean;
  payment: { _id: string; amount?: number; reference?: string; paidAt?: string } | null;
  waiveReason?: string | null;
  waivedAt?: string | null;
  cancelledAt?: string | null;
  createdByType?: "student" | "user";
  createdAt?: string;
};

export type ResitOverview = {
  /** The session resits are registered in; null when none is current. */
  session: { _id: string; name?: string } | null;
  courses: ResitCourse[];
  registrations: ResitRegistration[];
};
