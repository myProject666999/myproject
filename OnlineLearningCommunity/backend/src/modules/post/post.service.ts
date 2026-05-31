import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { GroupService } from '../group/group.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    private groupService: GroupService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async createPost(userId: number, dto: CreatePostDto): Promise<any> {
    if (dto.groupId) {
      const isMember = await this.groupService.isGroupMember(dto.groupId, userId);
      if (!isMember) {
        throw new ForbiddenException('不是该小组成员，无法发帖');
      }
    }

    const post = this.postRepository.create({
      userId,
      groupId: dto.groupId,
      content: dto.content,
      images: dto.images,
      isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
    });
    await this.postRepository.save(post);

    return this.formatPost(post);
  }

  async getPosts(
    page: number = 1,
    limit: number = 20,
    groupId?: number,
    userId?: number,
  ): Promise<any> {
    const where: any = {};
    if (groupId) {
      where.groupId = groupId;
    }
    if (userId) {
      where.userId = userId;
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });

    return {
      data: posts.map((p) => this.formatPost(p)),
      total,
      page,
      limit,
    };
  }

  async getFeed(userId: number, page: number = 1, limit: number = 20): Promise<any> {
    const userGroups = await this.groupService.getUserGroups(userId);
    const groupIds = userGroups.map((g) => g.id);

    const where: any = [
      { isPublic: true, groupId: null },
      ...groupIds.map((gid) => ({ groupId: gid })),
    ];

    const [posts, total] = await this.postRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });

    return {
      data: posts.map((p) => this.formatPost(p)),
      total,
      page,
      limit,
    };
  }

  async getPostDetail(id: number): Promise<any> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'group', 'comments', 'comments.user'],
    });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const comments = await this.commentRepository.find({
      where: { postId: id },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return {
      ...this.formatPost(post),
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        parentId: c.parentId,
        createdAt: c.createdAt,
        user: {
          id: c.user.id,
          username: c.user.username,
          nickname: c.user.nickname,
          avatar: c.user.avatar,
        },
      })),
    };
  }

  async commentPost(userId: number, postId: number, content: string, parentId?: number): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const comment = this.commentRepository.create({
      postId,
      userId,
      content,
      parentId,
    });
    await this.commentRepository.save(comment);

    post.commentCount += 1;
    await this.postRepository.save(post);

    return {
      id: comment.id,
      content: comment.content,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
    };
  }

  async likePost(userId: number, postId: number): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      post.likeCount -= 1;
      await this.postRepository.save(post);
      return { liked: false, likeCount: post.likeCount };
    }

    const like = this.likeRepository.create({ userId, postId });
    await this.likeRepository.save(like);
    post.likeCount += 1;
    await this.postRepository.save(post);

    return { liked: true, likeCount: post.likeCount };
  }

  async deletePost(userId: number, postId: number): Promise<any> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('无权删除此帖子');
    }

    await this.postRepository.remove(post);
    return { success: true };
  }

  async hasLiked(userId: number, postId: number): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { userId, postId },
    });
    return !!like;
  }

  private formatPost(post: Post): any {
    return {
      id: post.id,
      userId: post.userId,
      groupId: post.groupId,
      content: post.content,
      images: post.images,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      isPublic: post.isPublic,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.user
        ? {
            id: post.user.id,
            username: post.user.username,
            nickname: post.user.nickname,
            avatar: post.user.avatar,
          }
        : null,
      group: post.group
        ? {
            id: post.group.id,
            name: post.group.name,
            avatar: post.group.avatar,
          }
        : null,
    };
  }
}
