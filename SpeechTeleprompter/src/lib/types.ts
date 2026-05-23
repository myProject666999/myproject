export type ScriptSummary = {
  id: number;
  title: string;
  updatedAt: string;
};

export type ScriptDetail = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type ScriptRow = {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
};

function toIso(d: Date) {
  return d.toISOString();
}
