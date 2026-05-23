export interface HistoryItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryRequest {
  title: string;
  content: string;
}

export interface ConvertRequest {
  format: 'yaml' | 'xml';
  content: string;
}

export interface ConvertResponse {
  result: string;
}

export interface DiffLine {
  type: 'equal' | 'added' | 'removed';
  content: string;
  lineNumber?: number;
}

export interface JsonNode {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  children?: JsonNode[];
  isExpanded: boolean;
}
