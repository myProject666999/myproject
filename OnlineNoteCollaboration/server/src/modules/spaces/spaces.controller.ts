import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSpace(
    @Request() req: any,
    @Body() data: { name: string; description?: string },
  ) {
    return this.spacesService.createSpace(req.user.userId, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserSpaces(@Request() req: any) {
    return this.spacesService.getUserSpaces(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSpaceById(@Param('id') id: string) {
    return this.spacesService.getSpaceById(Number(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateSpace(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; avatar?: string },
  ) {
    return this.spacesService.updateSpace(Number(id), data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpace(@Param('id') id: string) {
    await this.spacesService.deleteSpace(Number(id));
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  async getSpaceMembers(@Param('id') id: string) {
    return this.spacesService.getSpaceMembers(Number(id));
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') id: string,
    @Body() data: { user_id: number; role: number },
  ) {
    return this.spacesService.addMember(Number(id), data.user_id, data.role);
  }

  @Put(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() data: { role: number },
  ) {
    await this.spacesService.updateMemberRole(
      Number(id),
      Number(userId),
      data.role,
    );
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await this.spacesService.removeMember(Number(id), Number(userId));
  }
}
