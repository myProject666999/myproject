import { Controller, Get, Post, Delete, Body, Param, Query, HttpException, HttpStatus, Ip, Headers } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review, ReviewComment } from './review.entity';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(
    @Body() reviewData: Partial<Review>,
    @Ip() ipAddress: string,
    @Headers('x-device-id') deviceId?: string,
  ): Promise<Review> {
    return this.reviewService.create(reviewData, ipAddress, deviceId);
  }

  @Get()
  async findReviews(
    @Query('campsiteId') campsiteId?: string,
    @Query('userId') userId?: string,
    @Query('isGuide') isGuide?: string,
    @Query('minRating') minRating?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ list: Review[]; total: number }> {
    return this.reviewService.findReviews({
      campsiteId: campsiteId ? +campsiteId : undefined,
      userId: userId ? +userId : undefined,
      isGuide: isGuide !== undefined ? parseInt(isGuide) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Review> {
    const review = await this.reviewService.findOne(+id);
    if (!review) {
      throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
    }
    return review;
  }

  @Post(':id/like')
  async likeReview(@Param('id') id: string): Promise<Review> {
    return this.reviewService.likeReview(+id);
  }

  @Delete(':id')
  async deleteReview(
    @Param('id') id: string,
    @Body('userId') userId: number,
  ): Promise<void> {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }
    return this.reviewService.deleteReview(+id, userId);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') reviewId: string,
    @Body('userId') userId: number,
    @Body('content') content: string,
    @Body('parentId') parentId?: number,
  ): Promise<ReviewComment> {
    if (!userId || !content) {
      throw new HttpException('userId and content are required', HttpStatus.BAD_REQUEST);
    }
    return this.reviewService.addComment(+reviewId, userId, content, parentId);
  }

  @Get(':id/comments')
  async findComments(@Param('id') reviewId: string): Promise<ReviewComment[]> {
    return this.reviewService.findComments(+reviewId);
  }

  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @Body('userId') userId: number,
  ): Promise<void> {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }
    return this.reviewService.deleteComment(+commentId, userId);
  }
}
