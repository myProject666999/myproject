const DecisionTree = require('../models/DecisionTree');

const DISCLAIMER = '免责声明：本系统提供的诊断结果仅供参考，不能替代专业医疗诊断。如有身体不适，请及时到正规医疗机构就诊。';

class DecisionTreeService {
  static async getNextQuestion(currentQuestionId, answer, questionHistory) {
    if (!currentQuestionId) {
      const rootQuestion = await DecisionTree.getRootQuestion();
      const answers = await DecisionTree.getAvailableAnswers(rootQuestion.id);
      return {
        question: rootQuestion,
        availableAnswers: answers,
        isComplete: false,
        questionHistory: [...questionHistory],
        disclaimer: DISCLAIMER
      };
    }

    const nextQuestion = await DecisionTree.getNextQuestion(currentQuestionId, answer);
    
    if (!nextQuestion) {
      return {
        question: null,
        availableAnswers: [],
        isComplete: true,
        result: {
          description: '感谢您的回答，请咨询专业医生获取准确诊断。',
          diseases: []
        },
        questionHistory,
        disclaimer: DISCLAIMER
      };
    }

    if (nextQuestion.is_leaf) {
      const diseaseIds = nextQuestion.result_disease_ids 
        ? nextQuestion.result_disease_ids.split(',').map(Number) 
        : [];
      const diseases = await DecisionTree.getResultDiseases(diseaseIds);
      
      return {
        question: nextQuestion,
        availableAnswers: [],
        isComplete: true,
        result: {
          description: nextQuestion.result_description,
          diseases: diseases.map(d => ({
            ...d,
            severity_text: { 1: '轻度', 2: '中度', 3: '重度' }[d.severity] || '未知'
          }))
        },
        questionHistory,
        disclaimer: DISCLAIMER
      };
    }

    const answers = await DecisionTree.getAvailableAnswers(nextQuestion.id);
    return {
      question: nextQuestion,
      availableAnswers: answers,
      isComplete: false,
      questionHistory,
      disclaimer: DISCLAIMER
    };
  }

  static generateResultAdvice(result) {
    if (!result || result.diseases.length === 0) {
      return result.description + '\n\n' + DISCLAIMER;
    }

    const topDisease = result.diseases[0];
    const hasSevere = result.diseases.some(d => d.severity === 3);
    
    let advice = result.description + '\n\n';
    
    if (hasSevere) {
      advice += '⚠️ **重要提示**：您的症状可能涉及较为严重的疾病，建议您尽快到医院就诊。\n\n';
    }
    
    advice += `建议就诊科室：${topDisease.department}\n\n`;
    advice += `就医建议：${topDisease.medical_advice}\n\n`;
    advice += DISCLAIMER;

    return advice;
  }
}

module.exports = DecisionTreeService;
