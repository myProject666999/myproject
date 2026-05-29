export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
  parentId: number;
  orgLevel: number;
  orgType: number;
  address: string;
  contactPerson: string;
  contactPhone: string;
  sortOrder: number;
  status: number;
  deleted?: number;
  createTime?: string;
  updateTime?: string;
  children?: Organization[];
}

export interface EmissionFactor {
  id: number;
  factorCode: string;
  factorName: string;
  factorType: number;
  category: string;
  subCategory: string;
  unit: string;
  co2Factor: number;
  ch4Factor: number;
  n2oFactor: number;
  totalFactor: number;
  version: string;
  standardSource: string;
  calculationFormula: string;
  description?: string;
  isCurrent: number;
  status: number;
  deleted?: number;
  createTime?: string;
  updateTime?: string;
}

export interface EmissionData {
  id: number;
  dataNo: string;
  orgId: number;
  emissionScope: number;
  sourceType: number;
  sourceCategory: string;
  activityName: string;
  activityDate: string;
  activityMonth: string;
  quantity: number;
  unit: string;
  factorId: number;
  factorVersion: string;
  description: string;
  batchNo: string;
  dataSource: number;
  status: number;
  auditUser?: string;
  auditTime?: string;
  auditRemark?: string;
  deleted?: number;
  createBy: string;
  createTime?: string;
  updateTime?: string;
}

export interface EmissionCalculation {
  id: number;
  calculationNo: string;
  orgId: number;
  periodType: number;
  periodValue: string;
  emissionScope: number;
  sourceType: number;
  activityTotal: number;
  emissionCo2: number;
  emissionCh4: number;
  emissionN2o: number;
  emissionTotal: number;
  factorVersion: string;
  calculationFormula: string;
  calculationDetail?: string;
  isSummary: number;
  parentCalculationId?: number;
  calculationStatus: number;
  confirmUser?: string;
  confirmTime?: string;
  remark?: string;
  deleted?: number;
  createTime?: string;
  updateTime?: string;
}

export interface ReductionTarget {
  id: number;
  targetNo: string;
  orgId: number;
  targetName: string;
  targetType: number;
  emissionScope: number;
  baseYear: string;
  baseEmission: number;
  targetYear: string;
  targetReductionRate: number;
  targetEmission: number;
  actualEmission: number;
  actualReductionRate: number;
  achievementRate: number;
  description: string;
  measures: string;
  status: number;
  deleted?: number;
  createBy?: string;
  createTime?: string;
  updateTime?: string;
}

export interface EsgIndicator {
  id: number;
  indicatorCode: string;
  indicatorName: string;
  dimension: number;
  category: string;
  indicatorType: number;
  unit: string;
  standard: string;
  calculationMethod: string;
  dataSource: string;
  description: string;
  sortOrder: number;
  status: number;
  deleted?: number;
  createTime?: string;
  updateTime?: string;
}

export interface EsgIndicatorData {
  id: number;
  indicatorId: number;
  orgId: number;
  periodType: number;
  periodValue: string;
  indicatorValue: number;
  indicatorText: string;
  supportingDocument?: string;
  status: number;
  auditUser?: string;
  auditTime?: string;
  auditRemark?: string;
  remark?: string;
  deleted?: number;
  createBy?: string;
  createTime?: string;
  updateTime?: string;
}

export interface Report {
  id: number;
  reportNo: string;
  reportName: string;
  reportType: number;
  orgId: number;
  templateId?: number;
  periodType: number;
  periodValue: string;
  reportStandard: string;
  version: number;
  parentReportId: number;
  reportFile?: string;
  reportContent?: string;
  totalEmission: number;
  scope1Emission: number;
  scope2Emission: number;
  scope3Emission: number;
  esgScore: number;
  reportStatus: number;
  publishTime?: string;
  auditUser?: string;
  auditTime?: string;
  approver?: string;
  approveTime?: string;
  remark?: string;
  deleted?: number;
  createBy: string;
  createTime?: string;
  updateTime?: string;
}

export interface ImportBatch {
  id: number;
  batchNo: string;
  orgId: number;
  importType: number;
  fileName: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  status: number;
  createBy: string;
  createTime?: string;
  updateTime?: string;
}
