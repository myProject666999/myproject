const pool = require("../config/db");
const { ValidationError, NotFoundError } = require("../middleware/errorHandler");

async function getUserHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { scale_id, page = 1, pageSize = 10 } = req.query;

    let whereClause = "WHERE s.user_id = ? AND s.status = 'completed'";
    const params = [userId];

    if (scale_id) {
      whereClause += " AND s.scale_id = ?";
      params.push(scale_id);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM answer_sessions s ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [rows] = await pool.query(
      `SELECT s.session_uuid, s.scale_id, s.total_score, s.severity_level,
              s.started_at, s.completed_at, s.duration_seconds,
              sc.name as scale_name, sc.code as scale_code, sc.category
       FROM answer_sessions s
       JOIN scales sc ON s.scale_id = sc.id
       ${whereClause}
       ORDER BY s.completed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({
      success: true,
      data: {
        records: rows,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / parseInt(pageSize)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getTrend(req, res, next) {
  try {
    const userId = req.user.id;
    const { scale_id } = req.params;

    if (!scale_id) {
      return next(new ValidationError("请指定量表"));
    }

    const [scale] = await pool.query(
      `SELECT id, name, code, min_score, max_score FROM scales WHERE id = ?`,
      [scale_id]
    );
    if (scale.length === 0) {
      return next(new NotFoundError("量表不存在"));
    }

    const [rows] = await pool.query(
      `SELECT s.session_uuid, s.total_score, s.severity_level,
              s.completed_at, s.duration_seconds
       FROM answer_sessions s
       WHERE s.user_id = ? AND s.scale_id = ? AND s.status = 'completed'
       ORDER BY s.completed_at ASC`,
      [userId, scale_id]
    );

    const trendData = rows.map((r) => ({
      session_uuid: r.session_uuid,
      score: parseFloat(r.total_score),
      severity_level: r.severity_level,
      completed_at: r.completed_at,
      duration_seconds: r.duration_seconds,
    }));

    let trendAnalysis = null;
    if (trendData.length >= 2) {
      const latestScore = trendData[trendData.length - 1].score;
      const previousScore = trendData[trendData.length - 2].score;
      const diff = latestScore - previousScore;

      let direction = "stable";
      if (diff > 0) direction = "increasing";
      else if (diff < 0) direction = "decreasing";

      trendAnalysis = {
        direction,
        diff: Math.abs(diff),
        latest_score: latestScore,
        previous_score: previousScore,
        assessment:
          direction === "decreasing"
            ? "您的得分呈下降趋势，症状可能有所改善，请继续保持。"
            : direction === "increasing"
            ? "您的得分呈上升趋势，症状可能有所加重，建议关注自身状况，必要时寻求专业帮助。"
            : "您的得分保持稳定，建议继续观察，定期自评。",
      };
    }

    res.json({
      success: true,
      data: {
        scale: scale[0],
        trend: trendData,
        analysis: trendAnalysis,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getScaleComparison(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT s.scale_id, s.total_score, s.severity_level, s.completed_at,
              sc.name as scale_name, sc.code as scale_code, sc.category, sc.max_score
       FROM answer_sessions s
       JOIN scales sc ON s.scale_id = sc.id
       WHERE s.user_id = ? AND s.status = 'completed'
       ORDER BY s.completed_at DESC`,
      [userId]
    );

    const latestByScale = {};
    for (const row of rows) {
      if (!latestByScale[row.scale_id]) {
        latestByScale[row.scale_id] = {
          scale_id: row.scale_id,
          scale_name: row.scale_name,
          scale_code: row.scale_code,
          category: row.category,
          latest_score: parseFloat(row.total_score),
          max_score: row.max_score,
          severity_level: row.severity_level,
          completed_at: row.completed_at,
        };
      }
    }

    res.json({
      success: true,
      data: Object.values(latestByScale),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserHistory,
  getTrend,
  getScaleComparison,
};
