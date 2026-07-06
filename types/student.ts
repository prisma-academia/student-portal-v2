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
