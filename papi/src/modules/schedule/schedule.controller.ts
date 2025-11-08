import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ScheduleService,
  type CreateScheduleDto,
  type UpdateScheduleDto,
} from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import {
  RecurringSchedule,
  ScheduleStatus,
} from './entities/recurring-schedule.entity';

class PauseScheduleDto {
  reason?: string;
}

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateScheduleDto,
  ): Promise<RecurringSchedule> {
    return this.scheduleService.createSchedule(userId, dto);
  }

  @Get()
  async getUserSchedules(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ScheduleStatus,
  ): Promise<RecurringSchedule[]> {
    return this.scheduleService.getUserSchedules(userId, status);
  }

  @Get('stats')
  async getScheduleStats(@CurrentUser('id') userId: string): Promise<{
    total: number;
    active: number;
    paused: number;
    totalAmountScheduled: number;
    successRate: number;
  }> {
    return this.scheduleService.getScheduleStats(userId);
  }

  @Get(':id')
  async getScheduleById(
    @CurrentUser('id') userId: string,
    @Param('id') scheduleId: string,
  ): Promise<RecurringSchedule> {
    return this.scheduleService.getScheduleById(scheduleId, userId);
  }

  @Put(':id')
  async updateSchedule(
    @CurrentUser('id') userId: string,
    @Param('id') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ): Promise<RecurringSchedule> {
    return this.scheduleService.updateSchedule(scheduleId, userId, dto);
  }

  @Post(':id/pause')
  async pauseSchedule(
    @CurrentUser('id') userId: string,
    @Param('id') scheduleId: string,
    @Body() dto: PauseScheduleDto,
  ): Promise<RecurringSchedule> {
    return this.scheduleService.pauseSchedule(scheduleId, userId, dto.reason);
  }

  @Post(':id/resume')
  async resumeSchedule(
    @CurrentUser('id') userId: string,
    @Param('id') scheduleId: string,
  ): Promise<RecurringSchedule> {
    return this.scheduleService.resumeSchedule(scheduleId, userId);
  }

  @Post(':id/cancel')
  async cancelSchedule(
    @CurrentUser('id') userId: string,
    @Param('id') scheduleId: string,
  ): Promise<RecurringSchedule> {
    return this.scheduleService.cancelSchedule(scheduleId, userId);
  }
}
