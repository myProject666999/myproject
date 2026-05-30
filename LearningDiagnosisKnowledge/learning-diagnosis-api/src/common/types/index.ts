export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer',
  CALCULATION = 'calculation',
}

export enum ExerciseType {
  PRACTICE = 'practice',
  EXAM = 'exam',
  DIAGNOSIS = 'diagnosis',
  RECOMMENDATION = 'recommendation',
}

export enum KnowledgeRelationType {
  PREREQUISITE = 'prerequisite',
  RELATED = 'related',
  DERIVED = 'derived',
  PART_OF = 'part_of',
}

export enum MasteryTrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
}

export enum WeaknessLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RecommendationType {
  WEAK_POINT = 'weak_point',
  FORGETTING = 'forgetting',
  PREVIEW = 'preview',
  COMPREHENSIVE = 'comprehensive',
}

export enum ReportType {
  STUDENT_PERSONAL = 'student_personal',
  STUDENT_PERIOD = 'student_period',
  CLASS_OVERALL = 'class_overall',
  CLASS_COMPARISON = 'class_comparison',
  DIAGNOSIS = 'diagnosis',
}

export enum ExportType {
  STUDENT_REPORT = 'student_report',
  CLASS_REPORT = 'class_report',
  ANSWER_RECORDS = 'answer_records',
  MASTERY_DATA = 'mastery_data',
  QUESTION_BANK = 'question_bank',
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum MasteryLevel {
  UNDERSTAND = 1,
  COMPREHEND = 2,
  APPLY = 3,
  SYNTHESIZE = 4,
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
}

export interface RequestUser {
  id: number;
  username: string;
  role: UserRole;
  realName: string;
}
