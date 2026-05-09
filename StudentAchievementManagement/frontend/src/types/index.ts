export interface Student {
  id?: number;
  studentNo: string;
  name: string;
  gender: string;
  birthDate: string;
  major: string;
  class: string;
}

export interface Course {
  id?: number;
  courseNo: string;
  name: string;
  teacher: string;
  credits: number;
  hours: number;
}

export interface Grade {
  id?: number;
  studentNo: string;
  courseNo: string;
  score: number;
  examDate: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface BatchDeleteRequest {
  ids: number[];
}
