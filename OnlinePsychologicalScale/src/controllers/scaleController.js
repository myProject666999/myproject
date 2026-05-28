const pool = require("../config/db");
const { getCache, setCache, delCache } = require("../config/redis");
const { NotFoundError } = require("../middleware/errorHandler");

async function listScales(req, res, next) {
  try {
    const cacheKey = "scales:list";
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const [rows] = await pool.query(
      `SELECT id, code, name, short_name, description, category, min_score, max_score, 
              estimated_minutes, source, is_active, sort_order
       FROM scales WHERE is_active = 1 ORDER BY sort_order ASC`
    );

    const [catRows] = await pool.query(
      `SELECT DISTINCT category FROM scales WHERE is_active = 1 ORDER BY category`
    );

    const result = { scales: rows, categories: catRows.map((r) => r.category) };
    await setCache(cacheKey, result, 600);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getScaleDetail(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `scales:detail:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const [scales] = await pool.query(
      `SELECT * FROM scales WHERE id = ? AND is_active = 1`,
      [id]
    );
    if (scales.length === 0) {
      return next(new NotFoundError("量表不存在"));
    }

    const scale = scales[0];

    const [questions] = await pool.query(
      `SELECT id, question_number, question_text, question_hint, is_required, sort_order
       FROM scale_questions WHERE scale_id = ? ORDER BY sort_order ASC`,
      [id]
    );

    const questionIds = questions.map((q) => q.id);
    let options = [];
    if (questionIds.length > 0) {
      const [optRows] = await pool.query(
        `SELECT id, question_id, option_value, option_text, sort_order
         FROM scale_options WHERE question_id IN (?) ORDER BY sort_order ASC`,
        [questionIds]
      );
      options = optRows;
    }

    const [rules] = await pool.query(
      `SELECT * FROM scale_scoring_rules WHERE scale_id = ?`,
      [id]
    );

    const [interpretations] = await pool.query(
      `SELECT * FROM scale_interpretations WHERE scale_id = ? ORDER BY sort_order ASC`,
      [id]
    );

    const optionsByQuestion = {};
    for (const opt of options) {
      if (!optionsByQuestion[opt.question_id]) {
        optionsByQuestion[opt.question_id] = [];
      }
      optionsByQuestion[opt.question_id].push(opt);
    }

    const questionsWithOptions = questions.map((q) => ({
      ...q,
      options: optionsByQuestion[q.id] || [],
    }));

    const result = {
      ...scale,
      questions: questionsWithOptions,
      scoring_rules: rules,
      interpretations,
    };

    await setCache(cacheKey, result, 600);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getScaleInterpretations(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM scale_interpretations WHERE scale_id = ? ORDER BY sort_order ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listScales,
  getScaleDetail,
  getScaleInterpretations,
};
