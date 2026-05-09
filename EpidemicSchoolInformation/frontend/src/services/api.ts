import axios from 'axios';
import { Student, Teacher, Visitor, Blacklist } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const studentService = {
  getAll: (keyword?: string) => 
    axios.get<Student[]>(`${API_BASE_URL}/students`, { params: { keyword } }),
  getById: (id: number) => 
    axios.get<Student>(`${API_BASE_URL}/students/${id}`),
  create: (data: Student) => 
    axios.post<Student>(`${API_BASE_URL}/students`, data),
  update: (id: number, data: Student) => 
    axios.put<Student>(`${API_BASE_URL}/students/${id}`, data),
  delete: (id: number) => 
    axios.delete(`${API_BASE_URL}/students/${id}`),
  search: (keyword: string) => 
    axios.get<Student[]>(`${API_BASE_URL}/students/search`, { params: { keyword } })
};

export const teacherService = {
  getAll: (keyword?: string) => 
    axios.get<Teacher[]>(`${API_BASE_URL}/teachers`, { params: { keyword } }),
  getById: (id: number) => 
    axios.get<Teacher>(`${API_BASE_URL}/teachers/${id}`),
  create: (data: Teacher) => 
    axios.post<Teacher>(`${API_BASE_URL}/teachers`, data),
  update: (id: number, data: Teacher) => 
    axios.put<Teacher>(`${API_BASE_URL}/teachers/${id}`, data),
  delete: (id: number) => 
    axios.delete(`${API_BASE_URL}/teachers/${id}`),
  search: (keyword: string) => 
    axios.get<Teacher[]>(`${API_BASE_URL}/teachers/search`, { params: { keyword } })
};

export const visitorService = {
  getAll: (keyword?: string) => 
    axios.get<Visitor[]>(`${API_BASE_URL}/visitors`, { params: { keyword } }),
  getById: (id: number) => 
    axios.get<Visitor>(`${API_BASE_URL}/visitors/${id}`),
  create: (data: Visitor) => 
    axios.post<Visitor>(`${API_BASE_URL}/visitors`, data),
  update: (id: number, data: Visitor) => 
    axios.put<Visitor>(`${API_BASE_URL}/visitors/${id}`, data),
  delete: (id: number) => 
    axios.delete(`${API_BASE_URL}/visitors/${id}`),
  search: (keyword: string) => 
    axios.get<Visitor[]>(`${API_BASE_URL}/visitors/search`, { params: { keyword } })
};

export const blacklistService = {
  getAll: (keyword?: string) => 
    axios.get<Blacklist[]>(`${API_BASE_URL}/blacklists`, { params: { keyword } }),
  getById: (id: number) => 
    axios.get<Blacklist>(`${API_BASE_URL}/blacklists/${id}`),
  create: (data: Blacklist) => 
    axios.post<Blacklist>(`${API_BASE_URL}/blacklists`, data),
  update: (id: number, data: Blacklist) => 
    axios.put<Blacklist>(`${API_BASE_URL}/blacklists/${id}`, data),
  delete: (id: number) => 
    axios.delete(`${API_BASE_URL}/blacklists/${id}`),
  search: (keyword: string) => 
    axios.get<Blacklist[]>(`${API_BASE_URL}/blacklists/search`, { params: { keyword } })
};
