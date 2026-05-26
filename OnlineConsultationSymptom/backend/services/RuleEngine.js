const Disease = require('../models/Disease');
const Symptom = require('../models/Symptom');

const DISCLAIMER = '免责声明：本系统提供的诊断结果仅供参考，不能替代专业医疗诊断。如有身体不适，请及时到正规医疗机构就诊。';

class RuleEngine {
  static async analyzeBySymptoms(symptomIds) {
    const matchedDiseases = await Disease.getBySymptoms(symptomIds);
    const symptoms = await Symptom.getByIds(symptomIds);
    
    if (matchedDiseases.length === 0) {
      return {
        diseases: [],
        advice: '根据您选择的症状，未匹配到常见疾病。建议您咨询专业医生进行详细检查。',
        symptoms,
        disclaimer: DISCLAIMER
      };
    }

    const totalWeight = matchedDiseases.reduce((sum, d) => sum + parseFloat(d.total_weight), 0);
    const diseasesWithProbability = matchedDiseases.map(disease => {
      const probability = totalWeight > 0 
        ? Math.min(95, Math.round((parseFloat(disease.total_weight) / totalWeight) * 100))
        : 0;
      
      const severityText = {
        1: '轻度',
        2: '中度',
        3: '重度'
      }[disease.severity] || '未知';

      return {
        ...disease,
        probability,
        severity_text: severityText
      };
    });

    const advice = this.generateAdvice(diseasesWithProbability);

    return {
      diseases: diseasesWithProbability,
      advice,
      symptoms,
      disclaimer: DISCLAIMER
    };
  }

  static generateAdvice(diseases) {
    if (diseases.length === 0) {
      return '建议您咨询专业医生进行详细检查。';
    }

    const hasSevere = diseases.some(d => d.severity === 3);
    const hasModerate = diseases.some(d => d.severity === 2);
    const topDisease = diseases[0];

    let advice = `根据您的症状，最可能的是${topDisease.name}。\n\n`;

    if (hasSevere) {
      advice += '⚠️ **重要提示**：您的症状可能涉及较为严重的疾病，' +
                '建议您尽快到医院就诊，以免延误病情。\n\n';
    } else if (hasModerate) {
      advice += '建议您关注症状变化，如果症状持续或加重，请及时就医。\n\n';
    } else {
      advice += '您的症状相对较轻，可以先观察并注意休息。如症状持续或加重，请及时就医。\n\n';
    }

    advice += `建议就诊科室：${topDisease.department}\n\n`;
    advice += `一般建议：${topDisease.treatment_suggestion}\n\n`;
    advice += DISCLAIMER;

    return advice;
  }
}

module.exports = RuleEngine;
