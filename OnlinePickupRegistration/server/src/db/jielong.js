const db = require('./index');

function createJielong({ title, description, fields, creator, deadline }) {
  const stmt = db.prepare(`
    INSERT INTO jielong (title, description, fields, creator, deadline)
    VALUES (@title, @description, @fields, @creator, @deadline)
  `);
  const result = stmt.run({
    title,
    description: description || null,
    fields: JSON.stringify(fields),
    creator,
    deadline: deadline || null,
  });
  return getJielongById(result.lastInsertRowid);
}

function getJielongById(id) {
  const stmt = db.prepare(`
    SELECT j.*, COUNT(p.id) as participant_count
    FROM jielong j
    LEFT JOIN participant p ON j.id = p.jielong_id
    WHERE j.id = ?
    GROUP BY j.id
  `);
  const row = stmt.get(id);
  if (row) {
    row.fields = JSON.parse(row.fields);
  }
  return row;
}

function getJielongList({ creator, status } = {}) {
  let sql = `
    SELECT j.*, COUNT(p.id) as participant_count
    FROM jielong j
    LEFT JOIN participant p ON j.id = p.jielong_id
    WHERE 1=1
  `;
  const params = [];
  if (creator) {
    sql += ' AND j.creator = ?';
    params.push(creator);
  }
  if (status) {
    sql += ' AND j.status = ?';
    params.push(status);
  }
  sql += ' GROUP BY j.id ORDER BY j.created_at DESC';
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows.map((row) => {
    row.fields = JSON.parse(row.fields);
    return row;
  });
}

function updateJielongStatus(id, status) {
  const stmt = db.prepare('UPDATE jielong SET status = ? WHERE id = ?');
  return stmt.run(status, id);
}

function deleteJielong(id) {
  const stmt = db.prepare('DELETE FROM jielong WHERE id = ?');
  return stmt.run(id);
}

module.exports = {
  createJielong,
  getJielongById,
  getJielongList,
  updateJielongStatus,
  deleteJielong,
};
