import { Controller, Get, Put, Post, Body, UseGuards, Request, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@ApiTags('用户')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req: any) {
    const user = await this.userService.findById(req.user.userId);
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      totalCheckins: user.totalCheckins,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      lastCheckinAt: user.lastCheckinAt,
      createdAt: user.createdAt,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    const { password, ...safeData } = updateData;
    const user = await this.userService.updateProfile(req.user.userId, safeData);
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
    };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传用户头像' })
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/avatars';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('只支持图片文件'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    if (!file) {
      throw new Error('请上传图片');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const user = await this.userService.updateProfile(req.user.userId, { avatar: avatarUrl });
    return {
      avatar: user.avatar,
      message: '头像上传成功',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(Number(id));
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      totalCheckins: user.totalCheckins,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      createdAt: user.createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    const users = await this.userService.findAll();
    return {
      data: users.slice((page - 1) * limit, page * limit),
      total: users.length,
      page,
      limit,
    };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取用户统计' })
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(Number(id));
  }
}
