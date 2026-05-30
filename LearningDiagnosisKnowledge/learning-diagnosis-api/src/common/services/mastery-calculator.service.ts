import { Injectable, Logger } from '@nestjs/common';

export interface MasteryCalculationInput {
  studentId: number;
  knowledgePointId: number;
  currentMastery: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  lastAnswerTime?: Date;
  firstAnswerTime?: Date;
  recentAnswers: Array<{
    isCorrect: number;
    difficulty: number;
    masteryLevel: number;
    weight: number;
    timeSpent?: number;
    answerTime: Date;
  }>;
  historicalMastery?: Array<{ date: Date; level: number }>;
  questionDifficulty: number;
  questionWeight: number;
  isCorrect: boolean;
}

export interface MasteryCalculationResult {
  masteryLevel: number;
  confidence: number;
  streak: number;
  forgettingCurve: number;
  masteryTrend: 'improving' | 'stable' | 'declining';
  calculationDetails: {
    baseScore: number;
    recencyBonus: number;
    difficultyBonus: number;
    weightAdjustment: number;
    streakBonus: number;
    forgettingPenalty: number;
    timePenalty: number;
    finalAdjustment: number;
    formula: string;
    explanation: string;
  };
}

@Injectable()
export class MasteryCalculatorService {
  private readonly logger = new Logger(MasteryCalculatorService.name);
  private readonly MODEL_VERSION = 'v1.0';

  calculate(input: MasteryCalculationInput): MasteryCalculationResult {
    const {
      currentMastery,
      totalQuestions,
      correctCount,
      wrongCount,
      recentAnswers,
      questionDifficulty,
      questionWeight,
      isCorrect,
      lastAnswerTime,
    } = input;

    const baseScore = this.calculateBaseScore(correctCount, totalQuestions + 1);
    const recencyBonus = this.calculateRecencyBonus(recentAnswers);
    const difficultyBonus = this.calculateDifficultyBonus(
      questionDifficulty,
      isCorrect,
    );
    const weightAdjustment = this.calculateWeightAdjustment(questionWeight);
    const streak = this.calculateStreak(recentAnswers, isCorrect);
    const streakBonus = this.calculateStreakBonus(streak);
    const forgettingPenalty = this.calculateForgettingPenalty(lastAnswerTime);
    const timePenalty = this.calculateTimePenalty(recentAnswers);

    let newMastery = currentMastery;

    if (isCorrect) {
      const maxPossibleIncrease = (100 - currentMastery) * 0.3;
      const increase =
        (baseScore * 0.4 +
          recencyBonus * 0.2 +
          difficultyBonus * 0.2 +
          streakBonus * 0.2) *
        weightAdjustment;
      const finalIncrease =
        Math.min(increase, maxPossibleIncrease) * (1 - forgettingPenalty);
      newMastery = Math.min(100, currentMastery + finalIncrease);
    } else {
      const maxPossibleDecrease = currentMastery * 0.25;
      const difficultyFactor = questionDifficulty / 5;
      const decrease =
        (20 + (1 - baseScore) * 30) *
        (0.5 + difficultyFactor * 0.5) *
        weightAdjustment;
      const finalDecrease =
        Math.min(decrease, maxPossibleDecrease) * (1 + forgettingPenalty * 0.5);
      newMastery = Math.max(0, currentMastery - finalDecrease);
    }

    const confidence = this.calculateConfidence(
      totalQuestions + 1,
      correctCount + (isCorrect ? 1 : 0),
    );
    const masteryTrend = this.calculateMasteryTrend(
      currentMastery,
      newMastery,
      input.historicalMastery,
    );
    const forgettingCurve = 1 - forgettingPenalty;

    const formula = isCorrect
      ? `mastery = min(100, current + min((base*0.4 + recency*0.2 + difficulty*0.2 + streak*0.2) * weight, maxIncrease) * (1 - forgetting))`
      : `mastery = max(0, current - min(decrease * weight, maxDecrease) * (1 + forgetting*0.5))`;

    const explanation = this.generateExplanation(
      isCorrect,
      questionDifficulty,
      currentMastery,
      newMastery,
      streak,
      forgettingCurve,
    );

    return {
      masteryLevel: Math.round(newMastery * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      streak,
      forgettingCurve: Math.round(forgettingCurve * 100) / 100,
      masteryTrend,
      calculationDetails: {
        baseScore: Math.round(baseScore * 100) / 100,
        recencyBonus: Math.round(recencyBonus * 100) / 100,
        difficultyBonus: Math.round(difficultyBonus * 100) / 100,
        weightAdjustment: Math.round(weightAdjustment * 100) / 100,
        streakBonus: Math.round(streakBonus * 100) / 100,
        forgettingPenalty: Math.round(forgettingPenalty * 100) / 100,
        timePenalty: Math.round(timePenalty * 100) / 100,
        finalAdjustment: Math.round((newMastery - currentMastery) * 100) / 100,
        formula,
        explanation,
      },
    };
  }

  private calculateBaseScore(
    correctCount: number,
    totalQuestions: number,
  ): number {
    if (totalQuestions === 0) return 0;
    const rawScore = correctCount / totalQuestions;
    const sampleSizeFactor = Math.min(1, totalQuestions / 10);
    return rawScore * sampleSizeFactor + 0.5 * (1 - sampleSizeFactor);
  }

  private calculateRecencyBonus(
    recentAnswers: Array<{ answerTime: Date }>,
  ): number {
    if (!recentAnswers || recentAnswers.length === 0) return 0;

    const now = new Date();
    let totalWeight = 0;
    const weightedScore = 0;

    for (let i = 0; i < Math.min(recentAnswers.length, 10); i++) {
      const answer = recentAnswers[i];
      const daysSinceAnswer =
        (now.getTime() - new Date(answer.answerTime).getTime()) /
        (1000 * 60 * 60 * 24);
      const recencyWeight = Math.exp(-daysSinceAnswer / 7);
      totalWeight += recencyWeight;
    }

    return totalWeight > 0
      ? Math.min(1, totalWeight / Math.min(recentAnswers.length, 10))
      : 0;
  }

  private calculateDifficultyBonus(
    difficulty: number,
    isCorrect: boolean,
  ): number {
    const normalizedDifficulty = difficulty / 5;
    if (isCorrect) {
      return 5 + normalizedDifficulty * 15;
    } else {
      return 0;
    }
  }

  private calculateWeightAdjustment(weight: number): number {
    return Math.max(0.5, Math.min(2, weight));
  }

  private calculateStreak(
    recentAnswers: Array<{ isCorrect: number }>,
    isCorrect: boolean,
  ): number {
    let streak = 0;
    for (let i = recentAnswers.length - 1; i >= 0; i--) {
      if (recentAnswers[i].isCorrect === (isCorrect ? 1 : 0)) {
        streak++;
      } else {
        break;
      }
    }
    return isCorrect ? streak + 1 : -(streak + 1);
  }

  private calculateStreakBonus(streak: number): number {
    const positiveStreak = Math.max(0, streak);
    return Math.min(20, positiveStreak * 2);
  }

  private calculateForgettingPenalty(lastAnswerTime?: Date): number {
    if (!lastAnswerTime) return 0;

    const now = new Date();
    const daysSinceLastAnswer =
      (now.getTime() - lastAnswerTime.getTime()) / (1000 * 60 * 60 * 24);

    const stabilityFactor = 0.9;
    const initialRetrievability = 1.0;
    const forgettingRate = 0.05;

    const retrievability =
      initialRetrievability *
      Math.exp(-(daysSinceLastAnswer / stabilityFactor) * forgettingRate);

    return Math.max(0, Math.min(0.5, 1 - retrievability));
  }

  private calculateTimePenalty(
    recentAnswers: Array<{ timeSpent?: number }>,
  ): number {
    if (!recentAnswers || recentAnswers.length < 3) return 0;

    const recent = recentAnswers.slice(-3);
    const avgTime =
      recent.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / recent.length;

    if (avgTime > 300) {
      return Math.min(0.2, (avgTime - 300) / 1000);
    }
    return 0;
  }

  private calculateConfidence(
    totalQuestions: number,
    correctCount: number,
  ): number {
    if (totalQuestions < 3) return Math.min(100, totalQuestions * 20);
    if (totalQuestions < 5) return 60;
    if (totalQuestions < 10) return 75;
    if (totalQuestions < 20) return 85;
    return Math.min(98, 70 + (correctCount / totalQuestions) * 28);
  }

  private calculateMasteryTrend(
    oldMastery: number,
    newMastery: number,
    historical?: Array<{ date: Date; level: number }>,
  ): 'improving' | 'stable' | 'declining' {
    const change = newMastery - oldMastery;

    if (Math.abs(change) < 2) {
      return 'stable';
    }

    if (historical && historical.length >= 3) {
      const recent = historical.slice(-3);
      const avgChange =
        recent.reduce((sum, h, i) => {
          if (i === 0) return sum;
          return sum + (h.level - recent[i - 1].level);
        }, 0) /
        (recent.length - 1);

      if ((change > 0 && avgChange > -1) || change > 3) {
        return 'improving';
      }
      if ((change < 0 && avgChange < 1) || change < -3) {
        return 'declining';
      }
      return 'stable';
    }

    return change > 0 ? 'improving' : 'declining';
  }

  private generateExplanation(
    isCorrect: boolean,
    difficulty: number,
    oldMastery: number,
    newMastery: number,
    streak: number,
    forgettingCurve: number,
  ): string {
    const change = newMastery - oldMastery;
    const difficultyText =
      ['极低', '低', '中等', '高', '极高'][difficulty - 1] || '中等';

    if (isCorrect) {
      const parts = [`答对了${difficultyText}难度的题目`];
      if (streak > 0) parts.push(`连续答对${streak}题`);
      if (forgettingCurve < 0.8)
        parts.push(
          `考虑到遗忘因素，记忆保持度${(forgettingCurve * 100).toFixed(0)}%`,
        );
      parts.push(`掌握度${change >= 0 ? '+' : ''}${change.toFixed(1)}%`);
      return parts.join('，');
    } else {
      const parts = [`答错了${difficultyText}难度的题目`];
      if (streak < 0) parts.push(`连续答错${Math.abs(streak)}题`);
      if (forgettingCurve < 0.8)
        parts.push(
          `考虑到遗忘因素，记忆保持度${(forgettingCurve * 100).toFixed(0)}%`,
        );
      parts.push(`掌握度${change.toFixed(1)}%`);
      return parts.join('，');
    }
  }

  calculateWeaknessScore(
    masteryLevel: number,
    recentWrongCount: number,
    totalQuestions: number,
    importanceLevel: number,
    lastAnswerTime?: Date,
  ): {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
  } {
    let score = 0;
    const reasons: string[] = [];

    if (masteryLevel < 40) {
      score += 40;
      reasons.push(`掌握度仅${masteryLevel.toFixed(1)}%，远低于及格线`);
    } else if (masteryLevel < 60) {
      score += 25;
      reasons.push(`掌握度${masteryLevel.toFixed(1)}%，未达到及格线`);
    } else if (masteryLevel < 70) {
      score += 10;
      reasons.push(`掌握度${masteryLevel.toFixed(1)}%，有待提升`);
    }

    if (recentWrongCount >= 3) {
      score += 25;
      reasons.push(`近期连续答错${recentWrongCount}题`);
    } else if (recentWrongCount >= 2) {
      score += 15;
      reasons.push(`近期答错${recentWrongCount}题`);
    }

    if (totalQuestions >= 5) {
      const accuracy =
        ((totalQuestions - recentWrongCount) / totalQuestions) * 100;
      if (accuracy < 50) {
        score += 20;
        reasons.push(`正确率仅${accuracy.toFixed(0)}%`);
      } else if (accuracy < 70) {
        score += 10;
        reasons.push(`正确率${accuracy.toFixed(0)}%，低于平均水平`);
      }
    }

    score += (importanceLevel / 5) * 15;
    if (importanceLevel >= 4) {
      reasons.push(`知识点重要程度高（${importanceLevel}/5）`);
    }

    if (lastAnswerTime) {
      const daysSince =
        (new Date().getTime() - lastAnswerTime.getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSince > 14) {
        score += 10;
        reasons.push(`已超过两周未练习，可能存在遗忘`);
      }
    }

    let level: 'critical' | 'high' | 'medium' | 'low';
    if (score >= 70) {
      level = 'critical';
    } else if (score >= 50) {
      level = 'high';
    } else if (score >= 30) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return {
      score: Math.min(100, Math.round(score)),
      level,
      reason: reasons.join('；'),
    };
  }
}
