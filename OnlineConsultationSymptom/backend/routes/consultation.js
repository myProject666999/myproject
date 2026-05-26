const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const RuleEngine = require('../services/RuleEngine');
const DecisionTreeService = require('../services/DecisionTreeService');
const History = require('../models/History');

const getUserId = (req) => {
  let userId = req.headers['x-user-id'];
  if (!userId) {
    userId = uuidv4();
  }
  return userId;
};

router.post('/analyze', async (req, res) => {
  try {
    const { symptomIds } = req.body;
    
    if (!symptomIds || !Array.isArray(symptomIds) || symptomIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请至少选择一个症状'
      });
    }

    const result = await RuleEngine.analyzeBySymptoms(symptomIds);
    const userId = getUserId(req);

    const historyId = await History.create({
      userId,
      symptomsSelected: symptomIds,
      resultDiseases: result.diseases,
      adviceGiven: result.advice,
      consultationType: 'symptom'
    });

    res.json({
      success: true,
      data: {
        ...result,
        historyId,
        userId
      }
    });
  } catch (error) {
    console.error('症状分析失败:', error);
    res.status(500).json({
      success: false,
      message: '症状分析失败'
    });
  }
});

router.get('/qa/start', async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await DecisionTreeService.getNextQuestion(null, null, []);
    
    res.json({
      success: true,
      data: {
        ...result,
        userId
      }
    });
  } catch (error) {
    console.error('开始问答失败:', error);
    res.status(500).json({
      success: false,
      message: '开始问答失败'
    });
  }
});

router.post('/qa/answer', async (req, res) => {
  try {
    const { currentQuestionId, answer, questionHistory } = req.body;
    const userId = getUserId(req);

    if (!currentQuestionId || !answer) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }

    const newHistory = [
      ...(questionHistory || []),
      { questionId: currentQuestionId, answer }
    ];

    const result = await DecisionTreeService.getNextQuestion(
      currentQuestionId,
      answer,
      newHistory
    );

    if (result.isComplete) {
      const advice = DecisionTreeService.generateResultAdvice(result.result);
      const historyId = await History.create({
        userId,
        questionAnswers: newHistory,
        resultDiseases: result.result.diseases,
        adviceGiven: advice,
        consultationType: 'qa'
      });

      result.result.advice = advice;
      result.historyId = historyId;
    }

    res.json({
      success: true,
      data: {
        ...result,
        userId
      }
    });
  } catch (error) {
    console.error('问答处理失败:', error);
    res.status(500).json({
      success: false,
      message: '问答处理失败'
    });
  }
});

module.exports = router;
