import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as dayjs from 'dayjs';
import { Review, ReviewComment } from './review.entity';
import { ReservationService } from '../reservation/reservation.service';
import { ReservationStatus } from '../reservation/reservation.entity';
import { CampsiteService } from '../campsite/campsite.service';

@Injectable()
export class ReviewService {
  private readonly ANTI_FLOOD_INTERVAL = 300;
  private readonly REVIEW_LIMIT_PER_RESERVATION = 1;

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewComment)
    private reviewCommentRepository: Repository<ReviewComment>,
    private reservationService: ReservationService,
    private campsiteService: CampsiteService,
  ) {}

  async checkAntiFlood(userId: number, ipAddress?: string): Promise<boolean> {
    const recentReview = await this.reviewRepository.findOne({
      where: [
        { userId, createdAt: MoreThan(dayjs().subtract(this.ANTI_FLOOD_INTERVAL, 'second').toDate()) },
        ipAddress ? { ipAddress, createdAt: MoreThan(dayjs().subtract(this.ANTI_FLOOD_INTERVAL, 'second').toDate()) } : {},
      ],
      order: { createdAt: 'DESC' },
    });

    return !recentReview;
  }

  async create(reviewData: Partial<Review>, ipAddress?: string, deviceId?: string): Promise<Review> {
    const reservation = await this.reservationService.findOne(reviewData.reservationId);
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    if (reservation.status !== ReservationStatus.CHECKED_OUT) {
      throw new HttpException('Only checked-out reservations can be reviewed', HttpStatus.BAD_REQUEST);
    }

    if (reservation.userId !== reviewData.userId) {
      throw new HttpException('You can only review your own reservation', HttpStatus.FORBIDDEN);
    }

    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId: reviewData.userId,
        reservationId: reviewData.reservationId,
      },
    });

    if (existingReview) {
      throw new HttpException('You have already reviewed this reservation', HttpStatus.BAD_REQUEST);
    }

    const canReview = await this.checkAntiFlood(reviewData.userId, ipAddress);
    if (!canReview) {
      throw new HttpException('Please wait before submitting another review', HttpStatus.TOO_MANY_REQUESTS);
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new HttpException('Rating must be between 1 and 5', HttpStatus.BAD_REQUEST);
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      campsiteId: reservation.campsiteId,
      isVerified: 1,
      ipAddress,
      deviceId,
    });

    const savedReview = await this.reviewRepository.save(review);

    await this.campsiteService.updateRating(reservation.campsiteId);

    return this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['user', 'campsite', 'reservation'],
    });
  }

  async findReviews(params?: {
    campsiteId?: number;
    userId?: number;
    isGuide?: number;
    minRating?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Review[]; total: number }> {
    const where: any = { status: 1 };
    if (params?.campsiteId) where.campsiteId = params.campsiteId;
    if (params?.userId) where.userId = params.userId;
    if (params?.isGuide !== undefined) where.isGuide = params.isGuide;

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;

    const [list, total] = await this.reviewRepository.findAndCount({
      where,
      relations: ['user', 'campsite'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC', likesCount: 'DESC' },
    });

    return { list, total };
  }

  async findOne(id: number): Promise<Review> {
    return this.reviewRepository.findOne({
      where: { id, status: 1 },
      relations: ['user', 'campsite', 'reservation', 'comments'],
    });
  }

  async likeReview(id: number): Promise<Review> {
    const review = await this.findOne(id);
    if (!review) {
      throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
    }

    review.likesCount += 1;
    await this.reviewRepository.save(review);
    return this.findOne(id);
  }

  async deleteReview(id: number, userId: number): Promise<void> {
    const review = await this.findOne(id);
    if (!review) {
      throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
    }

    if (review.userId !== userId) {
      throw new HttpException('You can only delete your own review', HttpStatus.FORBIDDEN);
    }

    review.status = 0;
    await this.reviewRepository.save(review);

    await this.campsiteService.updateRating(review.campsiteId);
  }

  async addComment(
    reviewId: number,
    userId: number,
    content: string,
    parentId?: number,
  ): Promise<ReviewComment> {
    const review = await this.findOne(reviewId);
    if (!review) {
      throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
    }

    const comment = this.reviewCommentRepository.create({
      reviewId,
      userId,
      parentId,
      content,
    });

    const savedComment = await this.reviewCommentRepository.save(comment);

    review.commentsCount += 1;
    await this.reviewRepository.save(review);

    return this.reviewCommentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  async findComments(reviewId: number): Promise<ReviewComment[]> {
    return this.reviewCommentRepository.find({
      where: { reviewId, status: 1 },
      relations: ['user', 'parent'],
      order: { createdAt: 'ASC' },
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.reviewCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new HttpException('You can only delete your own comment', HttpStatus.FORBIDDEN);
    }

    comment.status = 0;
    await this.reviewCommentRepository.save(comment);

    const review = await this.findOne(comment.reviewId);
    if (review) {
      review.commentsCount = Math.max(0, review.commentsCount - 1);
      await this.reviewRepository.save(review);
    }
  }
}
