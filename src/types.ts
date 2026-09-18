export interface SchemeData {
  title: string;
  c1_1: string;
  c1_2: string;
  c2_1: string;
  c2_2: string;
  c2_3: string;
  c3_1: string;
  c3_2: string;
  c4_1: string;
  c4_2: string;
  c4_3: string;
  c5_1: string;
  c5_2: string;
  c6_1: string;
  c6_2: string;
  c6_3: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  creator: string;
  createdAt: string;
  updatedAt?: string;
  expectedK?: number;
  actualK?: number;
  kTasks?: {
    csvTaskId?: string;
    dicomTaskId?: string;
  };
  schemeData?: any;
  schemeDocText?: string;
  schemeFileInfo?: {
    name: string;
    size: string;
    type: string;
    uploadTime: string;
  };
  schemeInputs?: any;
  isRegeneratingPending?: boolean;
  versions?: Array<{
    version: string;
    name: string;
    updatedAt: string;
    schemeInputs: any;
  }>;
}

export type ViewState = 'projects' | 'scheme' | 'scheme-doc' | 'processing' | 'evaluation' | 'system-mgmt' | 'env-config';

export interface ComplianceItem {
  id: string;
  name: string;
  desc: string;
  status: string;
  proofFile: string | null;
}

export interface CSVRow {
  [key: string]: string | number;
}

export interface DICOMTag {
  tag: string;
  name: string;
  original: string;
  anonymized: string;
  action: '替换' | '保留' | '删除' | '偏移' | '泛化';
}

export interface GeneralizationRule {
  from: string;
  to: string;
}

export interface FieldConfig {
  id: number;
  name: string;
  def: string;
  attr: "直接标识符" | "准标识符" | "敏感属性";
  tech: "原文" | "保留原值" | "属性删除" | "泛化" | "扰动/偏移" | "扰动(全局)" | "假名化" | "假名化(全局)";
  generalizationRules?: GeneralizationRule[];
  offsetDirection?: "向前" | "向后";
  offsetDays?: number;
  pseudonymizationMode?: "加密算法" | "直接设置固定值";
  pseudonymizationAlgo?: "SM3" | "SM4" | "根据数据匿名化的时间戳重新生成保持唯一";
  pseudonymizationFixed?: string;
  note: string;
  computeK: "是" | "否" | boolean;
  fieldName?: string;
  fieldChineseName?: string;
  definition?: string;
  attributeType?: "直接标识符" | "准标识符" | "敏感属性";
  pseudonymType?: "SM3" | "SM4" | "FIXED";
  fixedReplacement?: string;
  description?: string;
  fieldType?: "text" | "num" | "date";
  category?: "admission" | "check" | "test";
  splitField?: string;
}

export interface DicomConfig {
  id: number;
  tag: string;
  name: string;
  fieldChineseName?: string;
  tech: "原文" | "保留原值" | "属性删除" | "泛化" | "扰动/偏移" | "扰动(全局)" | "假名化" | "假名化(全局)";
  generalizationRules?: GeneralizationRule[];
  offsetDirection?: "向前" | "向后";
  offsetDays?: number;
  pseudonymizationMode?: "加密算法" | "直接设置固定值";
  pseudonymizationAlgo?: "SM3" | "SM4" | "根据数据匿名化的时间戳重新生成保持唯一";
  pseudonymizationFixed?: string;
  note: string;
  computeK: "是" | "否" | boolean;
  attr?: "直接标识符" | "准标识符" | "敏感属性";
  attributeType?: "直接标识符" | "准标识符" | "敏感属性";
  pseudonymType?: "SM3" | "SM4" | "FIXED";
  fixedReplacement?: string;
  description?: string;
  fieldType?: "text" | "num" | "date";
}

export interface UploadState {
  CSVProgress: number | null;
  dicomProgress: number | null;
  imageProgress?: number | null;
  CSVFileName: string | null;
  dicomFileName: string | null;
  imageFileName?: string | null;
  isUploading: boolean;
  isCompleted: boolean;
  isConfigCompleted?: boolean;
  parsedCSVFields?: FieldConfig[];
  parsedDICOMFields?: DicomConfig[];
}

