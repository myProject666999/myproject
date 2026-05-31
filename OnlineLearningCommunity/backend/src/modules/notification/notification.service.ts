import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 20): Promise<any> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        content: n.content,
        relatedId: n.relatedId,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: number, notificationId: number): Promise<any> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return { success: true };
  }

  async markAllAsRead(userId: number): Promise<any> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  async deleteNotification(userId: number, notificationId: number): Promise<any> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    await this.notificationRepository.remove(notification);
    return { success: true };
  }

  async createCheckinReminder(userId: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'checkin_reminder',
      title: '打卡提醒',
      content: '今天还没有打卡哦，快来打卡坚持学习！',
    });
  }
}
