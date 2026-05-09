export interface Student {
  id?: number;
  name: string;
  student_id: string;
  class: string;
  grade: string;
  phone: string;
  address: string;
  health_status: string;
  temperature: number;
  create_time?: string;
}

export interface Teacher {
  id?: number;
  name: string;
  teacher_id: string;
  department: string;
  position: string;
  phone: string;
  address: string;
  health_status: string;
  temperature: number;
  create_time?: string;
}

export interface Visitor {
  id?: number;
  name: string;
  id_card: string;
  phone: string;
  address: string;
  visit_reason: string;
  visit_person: string;
  health_status: string;
  temperature: number;
  create_time?: string;
}

export interface Blacklist {
  id?: number;
  name: string;
  id_card: string;
  phone: string;
  reason: string;
  create_time?: string;
}
