const db = require('./index');
const { getJielongById } = require('./jielong');
const eventBus = require('../eventBus');

function getMaxSeqNo(jielongId) {
  const stmt = db.prepare(
    'SELECT COALESCE(MAX(seq_no), 0) as max_seq FROM participant WHERE jielong_id = ?'
  );
  const row = stmt.get(jielongId);
  return row.max_seq;
}

function addParticipant(jielongId, data) {
  const jielong = getJielongById(jielongId);
  if (!jielong) {
    throw new Error('接龙不存在');
  }
  if (jielong.status !== 'active') {
    throw new Error('接龙已截止');
  }

  const tx = db.transaction((jielongId, data) => {
    const maxSeq = getMaxSeqNo(jielongId);
    const nextSeq = maxSeq + 1;
    const stmt = db.prepare(`
      INSERT INTO participant (jielong_id, seq_no, data)
      VALUES (?, ?, ?)
    `);
    try {
      const result = stmt.run(jielongId, nextSeq, JSON.stringify(data));
      return {
        id: result.lastInsertRowid,
        seq_no: nextSeq,
        jielong_id: jielongId,
        data,
      };
    } catch (err) {
      if (
        err.message.includes('UNIQUE constraint') ||
        err.message.includes('SQLITE_CONSTRAINT_UNIQUE')
      ) {
        throw new Error('序号冲突，请重试');
      }
      throw err;
    }
  });

  const result = tx(jielongId, data);
  eventBus.emit('participants-changed', jielongId);
  return result;
}

function getParticipants(jielongId) {
  const stmt = db.prepare(
    'SELECT * FROM participant WHERE jielong_id = ? ORDER BY seq_no ASC'
  );
  const rows = stmt.all(jielongId);
  return rows.map((row) => ({
    ...row,
    data: JSON.parse(row.data),
  }));
}

function deleteParticipant(id) {
  const findStmt = db.prepare('SELECT jielong_id FROM participant WHERE id = ?');
  const row = findStmt.get(id);
  const stmt = db.prepare('DELETE FROM participant WHERE id = ?');
  const result = stmt.run(id);
  if (row && row.jielong_id) {
    eventBus.emit('participants-changed', row.jielong_id);
  }
  return result;
}

module.exports = {
  addParticipant,
  getParticipants,
  deleteParticipant,
  getMaxSeqNo,
};
