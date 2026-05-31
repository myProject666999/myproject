import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('小组')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建小组' })
  async createGroup(@Request() req: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.userId, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: '获取小组列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  async getGroups(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.groupService.findAll(page, limit, category, keyword);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我加入的小组' })
  async getUserGroups(@Request() req: any) {
    return this.groupService.getUserGroups(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取小组详情' })
  async getGroupDetail(@Param('id') id: string) {
    return this.groupService.getGroupDetail(Number(id));
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '加入小组' })
  async joinGroup(@Request() req: any, @Param('id') id: string) {
    return this.groupService.joinGroup(Number(id), req.user.userId);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出小组' })
  async leaveGroup(@Request() req: any, @Param('id') id: string) {
    return this.groupService.leaveGroup(Number(id), req.user.userId);
  }
}
