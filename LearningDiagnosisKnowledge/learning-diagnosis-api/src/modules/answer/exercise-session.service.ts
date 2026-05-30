import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseSession } from '../../entities/exercise-session.entity';
import { Exercise } from '../../entities/exercise.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { StartExerciseDto } from './dto/start-exercise.dto';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';
import {
  PaginationResult,
  RequestUser,
  QueryAnswerDto,
} from '../../common/types';

@Injectable()
export class ExerciseSessionService {
  constructor(
    @InjectRepository(ExerciseSession)
    private readonly sessionRepository: Repository<ExerciseSession>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(AnswerRecord)
    private readonly answerRecordRepository: Repository<AnswerRecord>,
    private readonly masteryCalculatorService: MasteryCalculatorService,
  ) {}

  async startExercise(
    startExerciseDto: StartExerciseDto,
    currentUser: RequestUser,
  ): Promise<ExerciseSession> {
    const { exerciseId, classId } = startExerciseDto;

    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId, status: 1 },
    });
    if (!exercise) {
      throw new NotFoundException('练习不存在或已下架');
    }

    const existingSession = await this.sessionRepository.findOne({
      where: {
        studentId: currentUser.id,
        exerciseId,
        status: 'in_progress',
      },
    });

    if (existingSession) {
      return existingSession;
    }

    const session = new ExerciseSession();
    session.studentId = currentUser.id;
    session.exerciseId = exerciseId;
    session.classId = classId;
    session.startTime = new Date();
    session.status = 'in_progress';

    return this.sessionRepository.save(session);
  }

  async submitExercise(
    sessionId: number,
    currentUser: RequestUser,
  ): Promise<ExerciseSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['exercise'],
    });

    if (!session) {
      throw new NotFoundException('练习会话不存在');
    }

    if (session.studentId !== currentUser.id) {
      throw new ForbiddenException('无权提交他人的练习');
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException('该练习已提交，无法重复提交');
    }

    const answerRecords = await this.answerRecordRepository.find({
      where: {
        studentId: currentUser.id,
        exerciseId: session.exerciseId,
      },
      relations: ['question'],
    });

    const {
      totalScore,
      score,
      correctCount,
      wrongCount,
      timeSpent,
      hasSubjective,
    } = this.calculateExerciseStats(answerRecords, session);

    session.submitTime = new Date();
    session.totalScore = totalScore;
    session.score = score;
    session.correctCount = correctCount;
    session.wrongCount = wrongCount;
    session.timeSpent = timeSpent;
    session.status = hasSubjective ? 'submitted' : 'graded';

    return this.sessionRepository.save(session);
  }

  async getMySessions(
    queryDto: QueryAnswerDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<ExerciseSession>> {
    const { page, pageSize } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.exercise', 'exercise')
      .leftJoinAndSelect('es.class', 'class')
      .where('es.studentId = :studentId', { studentId: currentUser.id });

    const [list, total] = await queryBuilder
      .orderBy('es.startTime', 'DESC')
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

  async getSessionDetail(
    sessionId: number,
    currentUser: RequestUser,
  ): Promise<ExerciseSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: [
        'exercise',
        'exercise.exerciseQuestions',
        'exercise.exerciseQuestions.question',
        'class',
      ],
    });

    if (!session) {
      throw new NotFoundException('练习会话不存在');
    }

    if (session.studentId !== currentUser.id) {
      throw new ForbiddenException('无权查看他人的练习会话');
    }

    return session;
  }

  async getSessionAnswers(
    sessionId: number,
    currentUser: RequestUser,
  ): Promise<AnswerRecord[]> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('练习会话不存在');
    }

    if (session.studentId !== currentUser.id) {
      throw new ForbiddenException('无权查看他人的答题记录');
    }

    const answerRecords = await this.answerRecordRepository.find({
      where: {
        studentId: currentUser.id,
        exerciseId: session.exerciseId,
      },
      relations: ['question', 'subject'],
      order: {
        submitTime: 'ASC',
      },
    });

    return answerRecords;
  }

  private calculateExerciseStats(
    answerRecords: AnswerRecord[],
    session: ExerciseSession,
  ): {
    totalScore: number;
    score: number;
    correctCount: number;
    wrongCount: number;
    timeSpent: number;
    hasSubjective: boolean;
  } {
    let totalScore = 0;
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let totalTimeSpent = 0;
    let hasSubjective = false;

    for (const record of answerRecords) {
      if (record.question) {
        totalScore += record.question.score;
      }

      if (record.score !== null && record.score !== undefined) {
        score += Number(record.score);
      }

      if (record.isCorrect === 1) {
        correctCount++;
      } else if (record.isCorrect === 0) {
        wrongCount++;
      } else {
        hasSubjective = true;
      }

      if (record.timeSpent) {
        totalTimeSpent += record.timeSpent;
      }
    }

    if (totalTimeSpent === 0 && session.startTime) {
      const endTime = new Date();
      totalTimeSpent = Math.floor(
        (endTime.getTime() - session.startTime.getTime()) / 1000,
      );
    }

    return {
      totalScore,
      score,
      correctCount,
      wrongCount,
      timeSpent: totalTimeSpent,
      hasSubjective,
    };
  }
}
