const pool = require("../config/db");
const { getCache, setCache } = require("../config/redis");
const { NotFoundError } = require("../middleware/errorHandler");

async function listResources(req, res, next) {
  try {
    const { category_id, type, page = 1, pageSize = 10 } = req.query;

    const cacheKey = `resources:list:${category_id || "all"}:${type || "all"}:${page}:${pageSize}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    let whereClause = "WHERE r.is_active = 1";
    const params = [];

    if (category_id) {
      whereClause += " AND r.category_id = ?";
      params.push(category_id);
    }
    if (type) {
      whereClause += " AND r.resource_type = ?";
      params.push(type);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM resources r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [rows] = await pool.query(
      `SELECT r.id, r.category_id, r.title, r.summary, r.resource_type, 
              r.cover_image, r.external_url, r.phone_number, r.tags, r.author,
              r.view_count, r.published_at, rc.name as category_name
       FROM resources r
       LEFT JOIN resource_categories rc ON r.category_id = rc.id
       ${whereClause}
       ORDER BY r.sort_order ASC, r.published_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    const result = {
      resources: rows,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / parseInt(pageSize)),
      },
    };

    await setCache(cacheKey, result, 300);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getResourceDetail(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT r.*, rc.name as category_name
       FROM resources r
       LEFT JOIN resource_categories rc ON r.category_id = rc.id
       WHERE r.id = ? AND r.is_active = 1`,
      [id]
    );

    if (rows.length === 0) {
      return next(new NotFoundError("资源不存在"));
    }

    await pool.query(
      `UPDATE resources SET view_count = view_count + 1 WHERE id = ?`,
      [id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    const cacheKey = "resources:categories";
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const [rows] = await pool.query(
      `SELECT * FROM resource_categories WHERE is_active = 1 ORDER BY sort_order ASC`
    );

    await setCache(cacheKey, rows, 600);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function listHotlines(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.title, r.summary, r.phone_number, r.tags
       FROM resources r
       WHERE r.resource_type = 'hotline' AND r.is_active = 1
       ORDER BY r.sort_order ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listResources,
  getResourceDetail,
  listCategories,
  listHotlines,
};
