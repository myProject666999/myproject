import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review, ReviewComment } from './review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReservationModule } from '../reservation/reservation.module';
import { CampsiteModule } from '../campsite/campsite.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewComment]), ReservationModule, CampsiteModule],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
