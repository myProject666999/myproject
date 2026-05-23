import pool from "@/lib/db";
import type { ScriptDetail, ScriptSummary } from "@/lib/types";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

type ScriptRow = {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
} & RowDataPacket;

const toIso = (d: Date) => d.toISOString();

export async function listScripts(): Promise<ScriptSummary[]> {
  const [rows] = await pool.query<ScriptRow[]>(
    "SELECT id, title, content, created_at, updated_at FROM scripts ORDER BY updated_at DESC"
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: toIso(r.updated_at),
  }));
}

export async function getScript(id: number): Promise<ScriptDetail | null> {
  const [rows] = await pool.query<ScriptRow[]>(
    "SELECT id, title, content, created_at, updated_at FROM scripts WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
  };
}

export async function createScript(input: {
  title: string;
  content: string;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO scripts (title, content) VALUES (?, ?)",
    [input.title || "未命名稿件", input.content || ""]
  );
  return result.insertId;
}

export async function updateScript(
  id: number,
  input: { title?: string; content?: string }
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (input.title !== undefined) {
    sets.push("title = ?");
    params.push(input.title);
  }
  if (input.content !== undefined) {
    sets.push("content = ?");
    params.push(input.content);
  }
  if (sets.length === 0) return false;
  params.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE scripts SET ${sets.join(", ")} WHERE id = ?`,
    params
  );
  return result.affectedRows > 0;
}

export async function deleteScript(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM scripts WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}
