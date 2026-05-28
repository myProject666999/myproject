const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { setAutoSave, getAutoSave, delAutoSave } = require("../config/redis");
const { ValidationError, NotFoundError } = require("../middleware/errorHandler");

async function startSession(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { scale_id } = req.body;
    if (!scale_id) {
      return next(new ValidationError("请选择量表"));
    }

    const [scales] = await conn.query(
      `SELECT id, name FROM scales WHERE id = ? AND is_active = 1`,
      [scale_id]
    );
    if (scales.length === 0) {
      return next(new NotFoundError("量表不存在"));
    }

    const sessionUuid = uuidv4();
    const userId = req.user?.id || null;
    const clientIp = req.clientIp || "";
    const userAgent = req.headers["user-agent"] || "";

    const [result] = await conn.query(
      `INSERT INTO answer_sessions (session_uuid, user_id, scale_id, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionUuid, userId, scale_id, clientIp, userAgent]
    );

    await setAutoSave(sessionUuid, {}, 7200);

    res.status(201).json({
      success: true,
      data: {
        session_id: result.insertId,
        session_uuid: sessionUuid,
        scale_id,
        scale_name: scales[0].name,
        status: "in_progress",
        started_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
}

async function autoSaveAnswers(req, res, next) {
  try {
    const { session_uuid } = req.params;
    const { answers } = req.body;

    if (!session_uuid || !answers) {
      return next(new ValidationError("缺少必要参数"));
    }

    const [sessions] = await pool.query(
      `SELECT id, status, scale_id FROM answer_sessions WHERE session_uuid = ?`,
      [session_uuid]
    );
    if (sessions.length === 0) {
      return next(new NotFoundError("作答会话不存在"));
    }
    if (sessions[0].status !== "in_progress") {
      return next(new ValidationError("该会话已结束，无法继续作答"));
    }

    await setAutoSave(session_uuid, answers, 7200);

    res.json({ success: true, message: "自动保存成功" });
  } catch (err) {
    next(err);
  }
}

async function getAutoSavedAnswers(req, res, next) {
  try {
    const { session_uuid } = req.params;

    const answers = await getAutoSave(session_uuid);

    res.json({ success: true, data: { answers: answers || {} } });
  } catch (err) {
    next(err);
  }
}

async function submitAnswers(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { session_uuid } = req.params;
    const { answers } = req.body;

    if (!session_uuid || !answers || typeof answers !== "object") {
      return next(new ValidationError("缺少必要参数"));
    }

    const [sessions] = await conn.query(
      `SELECT id, status, scale_id, started_at FROM answer_sessions WHERE session_uuid = ?`,
      [session_uuid]
    );
    if (sessions.length === 0) {
      return next(new NotFoundError("作答会话不存在"));
    }
    if (sessions[0].status !== "in_progress") {
      return next(new ValidationError("该会话已提交，不能重复提交"));
    }

    const session = sessions[0];

    const [questions] = await conn.query(
      `SELECT id, question_number, is_required FROM scale_questions WHERE scale_id = ? ORDER BY sort_order`,
      [session.scale_id]
    );

    const requiredQuestions = questions.filter((q) => q.is_required);
    const answeredQuestionIds = new Set(Object.keys(answers).map(Number));

    for (const rq of requiredQuestions) {
      if (!answeredQuestionIds.has(rq.id)) {
        return next(
          new ValidationError(`请完成所有必答题（第${rq.question_number}题未作答）`)
        );
      }
    }

    for (const [questionIdStr, optionId] of Object.entries(answers)) {
      const questionId = parseInt(questionIdStr);
      const [options] = await conn.query(
        `SELECT id, option_value FROM scale_options WHERE question_id = ? AND id = ?`,
        [questionId, optionId]
      );
      if (options.length === 0) {
        return next(
          new ValidationError(`题目${questionId}的选项${optionId}无效`)
        );
      }

      await conn.query(
        `INSERT INTO answer_details (session_id, question_id, option_id, option_value, answered_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), option_value = VALUES(option_value), answered_at = NOW()`,
        [session.id, questionId, optionId, options[0].option_value]
      );
    }

    const [rules] = await conn.query(
      `SELECT * FROM scale_scoring_rules WHERE scale_id = ? AND rule_type = 'total'`,
      [session.scale_id]
    );

    let totalScore = 0;
    if (rules.length > 0) {
      const rule = rules[0];
      const includedQs = rule.included_questions
        .split(",")
        .map((n) => parseInt(n.trim()));

      const includedQuestionIds = questions
        .filter((q) => includedQs.includes(q.question_number))
        .map((q) => q.id);

      if (includedQuestionIds.length > 0) {
        const [answerRows] = await conn.query(
          `SELECT question_id, option_value FROM answer_details WHERE session_id = ? AND question_id IN (?)`,
          [session.id, includedQuestionIds]
        );

        for (const row of answerRows) {
          totalScore += row.option_value || 0;
        }
      }
    }

    const [interpretations] = await conn.query(
      `SELECT * FROM scale_interpretations WHERE scale_id = ? AND ? BETWEEN min_score AND max_score ORDER BY sort_order LIMIT 1`,
      [session.scale_id, totalScore]
    );

    const interpretation =
      interpretations.length > 0 ? interpretations[0] : null;
    const severityLevel = interpretation
      ? interpretation.severity_level
      : "未知";
    const isHighRisk = interpretation ? interpretation.is_high_risk : 0;

    const durationSeconds = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    );

    await conn.query(
      `UPDATE answer_sessions 
       SET status = 'completed', total_score = ?, severity_level = ?, completed_at = NOW(), duration_seconds = ?
       WHERE id = ?`,
      [totalScore, severityLevel, durationSeconds, session.id]
    );

    await delAutoSave(session_uuid);

    await conn.commit();

    let specialAlert = null;
    if (session.scale_id === 1) {
      const [q9] = await conn.query(
        `SELECT ad.option_value FROM answer_details ad
         JOIN scale_questions sq ON ad.question_id = sq.id
         WHERE ad.session_id = ? AND sq.question_number = 9`,
        [session.id]
      );
      if (q9.length > 0 && q9[0].option_value >= 1) {
        specialAlert = {
          type: "self_harm_risk",
          message: "检测到自伤/自杀风险信号",
          level: q9[0].option_value >= 2 ? "high" : "moderate",
          hotlines: [
            "全国24小时心理危机干预热线：400-161-9995",
            "北京心理危机研究与干预中心：010-82951332",
            "生命热线：400-821-1215",
          ],
          disclaimer:
            "⚠️ 本评估结果仅为筛查参考，不能替代专业医学诊断。如果您有自伤或自杀的想法，请立即拨打危机干预热线或前往最近医院急诊科。",
        };
      }
    }

    res.json({
      success: true,
      data: {
        session_uuid,
        total_score: totalScore,
        severity_level: severityLevel,
        severity_color: interpretation?.severity_color || "#999",
        interpretation: interpretation
          ? {
              level: interpretation.severity_level,
              color: interpretation.severity_color,
              text: interpretation.interpretation,
              suggestion: interpretation.suggestion,
            }
          : null,
        is_high_risk: !!isHighRisk,
        referral_prompt: interpretation?.referral_prompt || null,
        disclaimer: interpretation?.disclaimer || null,
        special_alert: specialAlert,
        duration_seconds: durationSeconds,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

async function getSessionResult(req, res, next) {
  try {
    const { session_uuid } = req.params;

    const [sessions] = await pool.query(
      `SELECT s.*, sc.name as scale_name, sc.code as scale_code
       FROM answer_sessions s
       JOIN scales sc ON s.scale_id = sc.id
       WHERE s.session_uuid = ?`,
      [session_uuid]
    );
    if (sessions.length === 0) {
      return next(new NotFoundError("作答会话不存在"));
    }

    const session = sessions[0];
    if (session.status !== "completed") {
      return next(new ValidationError("该会话尚未完成"));
    }

    const [details] = await pool.query(
      `SELECT ad.question_id, ad.option_value, sq.question_number, sq.question_text, so.option_text
       FROM answer_details ad
       JOIN scale_questions sq ON ad.question_id = sq.id
       LEFT JOIN scale_options so ON ad.option_id = so.id
       WHERE ad.session_id = ?
       ORDER BY sq.sort_order`,
      [session.id]
    );

    const [interpretation] = await pool.query(
      `SELECT * FROM scale_interpretations 
       WHERE scale_id = ? AND ? BETWEEN min_score AND max_score
       ORDER BY sort_order LIMIT 1`,
      [session.scale_id, session.total_score]
    );

    let specialAlert = null;
    if (session.scale_id === 1) {
      const selfHarmDetail = details.find((d) => d.question_number === 9);
      if (selfHarmDetail && selfHarmDetail.option_value >= 1) {
        specialAlert = {
          type: "self_harm_risk",
          message: "检测到自伤/自杀风险信号",
          level: selfHarmDetail.option_value >= 2 ? "high" : "moderate",
          hotlines: [
            "全国24小时心理危机干预热线：400-161-9995",
            "北京心理危机研究与干预中心：010-82951332",
            "生命热线：400-821-1215",
          ],
        };
      }
    }

    res.json({
      success: true,
      data: {
        session_uuid,
        scale_name: session.scale_name,
        scale_code: session.scale_code,
        total_score: session.total_score,
        severity_level: session.severity_level,
        status: session.status,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_seconds: session.duration_seconds,
        details,
        interpretation: interpretation[0] || null,
        special_alert: specialAlert,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startSession,
  autoSaveAnswers,
  getAutoSavedAnswers,
  submitAnswers,
  getSessionResult,
};
