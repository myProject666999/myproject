export interface User {
  id: string;
  username: string;
  realName: string;
  role: 'admin' | 'teacher' | 'student';
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon?: string;
  description?: string;
  sortOrder: number;
  status: number;
}

export interface KnowledgePoint {
  id: string;
  name: string;
  code: string;
  description?: string;
  subjectId: string;
  parentId?: string;
  depth: number;
  path: string;
  difficultyLevel: number;
  importanceLevel: number;
  sortOrder: number;
  status: number;
  children?: KnowledgePoint[];
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  masteryLevel?: number;
  importanceLevel: number;
  difficultyLevel: number;
  x?: number;
  y?: number;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  type: 'prerequisite' | 'related' | 'sub';
}

export interface KnowledgeMastery {
  id: string;
  studentId: string;
  knowledgePointId: string;
  subjectId: string;
  masteryLevel: number;
  confidence: number;
  totalAttempts: number;
  correctAttempts: number;
  forgettingCurve: number;
  lastPracticeAt?: string;
  calculationDetails: {
    components: {
      baseScore: number;
      recentPerformance: number;
      difficultyWeight: number;
      streakBonus: number;
      forgettingFactor: number;
    };
    explanation: string;
  };
}

export interface WeakPoint {
  id: string;
  studentId: string;
  knowledgePointId: string;
  subjectId: string;
  severityLevel: 'critical' | 'high' | 'medium' | 'low';
  errorRate: number;
  reasonAnalysis: string;
  detectedAt: string;
  knowledgePoint: KnowledgePoint;
}

export interface Recommendation {
  id: string;
  studentId: string;
  subjectId: string;
  type: 'weak_point' | 'forgetting' | 'preview' | 'comprehensive';
  title: string;
  description: string;
  reason: string;
  targetKnowledgePoints: string[];
  questionCount: number;
  difficultyLevel: number;
  estimatedTime: number;
  exerciseId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: string;
  validUntil: string;
}

export interface ClassEntity {
  id: string;
  name: string;
  grade: string;
  subject: string;
  teacherId: string;
  description?: string;
  studentCount: number;
  status: number;
}

export interface LearningReport {
  id: string;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  type: 'student_personal' | 'student_period' | 'class_overall' | 'class_comparison' | 'diagnosis';
  title: string;
  content: {
    overview?: {
      totalKnowledgePoints: number;
      masteredCount: number;
      weakPointsCount: number;
      correctRate: number;
      overallScore: number;
    };
    masteryData?: any[];
    weakPoints?: any[];
    suggestions?: string[];
  };
  overallScore: number;
  generatedAt: string;
}

export interface ExportRecord {
  id: string;
  type: string;
  format: string;
  status: string;
  fileName?: string;
  createdAt: string;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
