import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { Question } from '../../entities/question.entity';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QueryAnswerDto } from './dto/query-answer.dto';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';
import {
  QuestionType,
  PaginationResult,
  RequestUser,
} from '../../common/types';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(AnswerRecord)
    private readonly answerRecordRepository: Repository<AnswerRecord>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly masteryCalculatorService: MasteryCalculatorService,
  ) {}

  async submitAnswer(
    submitAnswerDto: SubmitAnswerDto,
    currentUser: RequestUser,
  ): Promise<AnswerRecord> {
    const {
      questionId,
      exerciseId,
      studentAnswer,
      timeSpent,
      startTime,
      answerMetadata,
    } = submitAnswerDto;

    const question = await this.questionRepository.findOne({
      where: { id: questionId, status: 1 },
    });
    if (!question) {
      throw new NotFoundException('题目不存在或已下架');
    }

    const answerRecord = new AnswerRecord();
    answerRecord.studentId = currentUser.id;
    answerRecord.questionId = questionId;
    answerRecord.subjectId = question.subjectId;
    answerRecord.exerciseId = exerciseId;
    answerRecord.studentAnswer = studentAnswer;
    answerRecord.timeSpent = timeSpent;
    answerRecord.startTime = startTime || new Date();
    answerRecord.submitTime = new Date();
    answerRecord.source = exerciseId ? 'exercise' : 'manual';
    answerRecord.answerMetadata = answerMetadata;

    const isObjective = this.isObjectiveQuestion(question.type);
    if (isObjective) {
      const { isCorrect, score } = this.autoGrade(question, studentAnswer);
      answerRecord.isCorrect = isCorrect ? 1 : 0;
      answerRecord.score = score;
    } else {
      answerRecord.isCorrect = null;
      answerRecord.score = null;
    }

    const savedRecord = await this.answerRecordRepository.save(answerRecord);

    return savedRecord;
  }

  async getMyAnswerRecords(
    queryDto: QueryAnswerDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<AnswerRecord>> {
    const {
      page,
      pageSize,
      subjectId,
      startTime,
      endTime,
      isCorrect,
      exerciseId,
    } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.answerRecordRepository
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.question', 'question')
      .leftJoinAndSelect('ar.subject', 'subject')
      .where('ar.studentId = :studentId', { studentId: currentUser.id });

    if (subjectId) {
      queryBuilder.andWhere('ar.subjectId = :subjectId', { subjectId });
    }

    if (startTime) {
      queryBuilder.andWhere('ar.submitTime >= :startTime', {
        startTime: new Date(startTime),
      });
    }

    if (endTime) {
      queryBuilder.andWhere('ar.submitTime <= :endTime', {
        endTime: new Date(endTime),
      });
    }

    if (isCorrect !== undefined) {
      queryBuilder.andWhere('ar.isCorrect = :isCorrect', { isCorrect });
    }

    if (exerciseId) {
      queryBuilder.andWhere('ar.exerciseId = :exerciseId', { exerciseId });
    }

    const [list, total] = await queryBuilder
      .orderBy('ar.submitTime', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getAnswerRecordDetail(
    id: number,
    currentUser: RequestUser,
  ): Promise<AnswerRecord> {
    const record = await this.answerRecordRepository.findOne({
      where: { id },
      relations: ['question', 'subject', 'exercise'],
    });

    if (!record) {
      throw new NotFoundException('答题记录不存在');
    }

    if (record.studentId !== currentUser.id) {
      throw new ForbiddenException('无权查看他人的答题记录');
    }

    return record;
  }

  async getQuestionHistory(
    questionId: number,
    currentUser: RequestUser,
  ): Promise<AnswerRecord[]> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    const records = await this.answerRecordRepository.find({
      where: {
        studentId: currentUser.id,
        questionId,
      },
      order: {
        submitTime: 'DESC',
      },
    });

    return records;
  }

  async getWrongBook(
    queryDto: QueryAnswerDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<AnswerRecord>> {
    const { page, pageSize, subjectId, startTime, endTime } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.answerRecordRepository
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.question', 'question')
      .leftJoinAndSelect('ar.subject', 'subject')
      .where('ar.studentId = :studentId', { studentId: currentUser.id })
      .andWhere('ar.isCorrect = :isCorrect', { isCorrect: 0 });

    if (subjectId) {
      queryBuilder.andWhere('ar.subjectId = :subjectId', { subjectId });
    }

    if (startTime) {
      queryBuilder.andWhere('ar.submitTime >= :startTime', {
        startTime: new Date(startTime),
      });
    }

    if (endTime) {
      queryBuilder.andWhere('ar.submitTime <= :endTime', {
        endTime: new Date(endTime),
      });
    }

    const [list, total] = await queryBuilder
      .orderBy('ar.submitTime', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async redoWrongQuestion(
    id: number,
    currentUser: RequestUser,
  ): Promise<AnswerRecord> {
    const originalRecord = await this.answerRecordRepository.findOne({
      where: { id },
    });

    if (!originalRecord) {
      throw new NotFoundException('答题记录不存在');
    }

    if (originalRecord.studentId !== currentUser.id) {
      throw new ForbiddenException('无权重做他人的错题');
    }

    if (originalRecord.isCorrect !== 0) {
      throw new BadRequestException('该题答对了，不需要重做');
    }

    const question = await this.questionRepository.findOne({
      where: { id: originalRecord.questionId, status: 1 },
    });
    if (!question) {
      throw new NotFoundException('题目不存在或已下架');
    }

    const redoRecord = new AnswerRecord();
    redoRecord.studentId = currentUser.id;
    redoRecord.questionId = originalRecord.questionId;
    redoRecord.subjectId = originalRecord.subjectId;
    redoRecord.exerciseId = originalRecord.exerciseId;
    redoRecord.source = 'redo';
    redoRecord.startTime = new Date();
    redoRecord.submitTime = new Date();
    redoRecord.answerMetadata = {
      originalRecordId: id,
      isRedo: true,
    };

    return this.answerRecordRepository.save(redoRecord);
  }

  private isObjectiveQuestion(type: QuestionType): boolean {
    const objectiveTypes = [
      QuestionType.SINGLE_CHOICE,
      QuestionType.MULTIPLE_CHOICE,
      QuestionType.TRUE_FALSE,
    ];
    return objectiveTypes.includes(type);
  }

  private autoGrade(
    question: Question,
    studentAnswer: string,
  ): { isCorrect: boolean; score: number } {
    if (!studentAnswer || !question.answer) {
      return { isCorrect: false, score: 0 };
    }

    let isCorrect = false;

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        isCorrect =
          this.normalizeAnswer(studentAnswer) ===
          this.normalizeAnswer(question.answer);
        break;

      case QuestionType.MULTIPLE_CHOICE:
        isCorrect = this.compareMultipleChoiceAnswers(
          studentAnswer,
          question.answer,
        );
        break;

      default:
        return { isCorrect: false, score: null };
    }

    const score = isCorrect ? question.score : 0;
    return { isCorrect, score };
  }

  private normalizeAnswer(answer: string): string {
    return answer
      .trim()
      .toUpperCase()
      .replace(/[\s,，;；]/g, '');
  }

  private compareMultipleChoiceAnswers(
    studentAnswer: string,
    correctAnswer: string,
  ): boolean {
    const normalize = (ans: string) => {
      return ans
        .trim()
        .toUpperCase()
        .split(/[\s,，;；]+/)
        .filter((c) => c)
        .sort()
        .join('');
    };

    return normalize(studentAnswer) === normalize(correctAnswer);
  }
}
