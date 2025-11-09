import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThanOrEqual } from 'typeorm';
import {
  RecurringSchedule,
  ScheduleStatus,
  ScheduleFrequency,
} from './entities/recurring-schedule.entity';
import { TimeService, ScheduleConfig } from '@common/services/time.service';
import { WalletService } from '../wallet/wallet.service';

export interface CreateScheduleDto {
  recipientId: string;
  amount: number;
  frequency: ScheduleFrequency;
  startDate: string;
  endDate?: string;
  hour: number;
  minute: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  customIntervalDays?: number;
  description?: string;
  userTimezone?: string;
}

export interface UpdateScheduleDto {
  amount?: number;
  frequency?: ScheduleFrequency;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  customIntervalDays?: number;
  description?: string;
  endDate?: string;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(RecurringSchedule)
    private scheduleRepository: Repository<RecurringSchedule>,
    private timeService: TimeService,
    private walletService: WalletService,
  ) {}

  private async findScheduleByIdAndUser(
    scheduleId: string,
    userId: string,
  ): Promise<RecurringSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, userId },
      relations: ['recipient'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async createSchedule(
    userId: string,
    dto: CreateScheduleDto,
  ): Promise<RecurringSchedule> {
    const { startDate, config } = this.timeService.createScheduleFromUserInput(
      dto.startDate,
      dto.frequency,
      dto.hour,
      dto.minute,
      dto.userTimezone,
      {
        dayOfWeek: dto.dayOfWeek,
        dayOfMonth: dto.dayOfMonth,
        customIntervalDays: dto.customIntervalDays,
      },
    );

    const nextRunDate = this.timeService.calculateNextRunDate(
      startDate,
      config,
      dto.userTimezone,
    );

    const schedule = this.scheduleRepository.create({
      userId,
      recipientId: dto.recipientId,
      amount: dto.amount,
      frequency: dto.frequency,
      dayOfWeek: dto.dayOfWeek,
      dayOfMonth: dto.dayOfMonth,
      customIntervalDays: dto.customIntervalDays,
      hour: dto.hour,
      minute: dto.minute,
      startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      nextRunDate,
      description: dto.description,
      status: ScheduleStatus.ACTIVE,
    });

    return this.scheduleRepository.save(schedule);
  }

  async updateSchedule(
    scheduleId: string,
    userId: string,
    dto: UpdateScheduleDto,
  ): Promise<RecurringSchedule> {
    const schedule = await this.findScheduleByIdAndUser(scheduleId, userId);

    if (dto.amount !== undefined) schedule.amount = dto.amount;
    if (dto.frequency !== undefined) schedule.frequency = dto.frequency;
    if (dto.hour !== undefined) schedule.hour = dto.hour;
    if (dto.minute !== undefined) schedule.minute = dto.minute;
    if (dto.dayOfWeek !== undefined) schedule.dayOfWeek = dto.dayOfWeek;
    if (dto.dayOfMonth !== undefined) schedule.dayOfMonth = dto.dayOfMonth;
    if (dto.customIntervalDays !== undefined)
      schedule.customIntervalDays = dto.customIntervalDays;
    if (dto.description !== undefined) schedule.description = dto.description;
    if (dto.endDate !== undefined)
      schedule.endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    const config: ScheduleConfig = {
      frequency: schedule.frequency,
      hour: schedule.hour as number,
      minute: schedule.minute as number,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      customIntervalDays: schedule.customIntervalDays,
    };

    schedule.nextRunDate = this.timeService.calculateNextRunDate(
      (schedule.lastRunDate || schedule.startDate) as Date,
      config,
    );

    return this.scheduleRepository.save(schedule);
  }

  async pauseSchedule(
    scheduleId: string,
    userId: string,
    reason?: string,
  ): Promise<RecurringSchedule> {
    const schedule = await this.findScheduleByIdAndUser(scheduleId, userId);
    if (schedule.status !== ScheduleStatus.ACTIVE) {
      throw new BadRequestException('Only active schedules can be paused');
    }

    schedule.status = ScheduleStatus.PAUSED;
    schedule.pauseReason = reason;

    return this.scheduleRepository.save(schedule);
  }

  async resumeSchedule(
    scheduleId: string,
    userId: string,
  ): Promise<RecurringSchedule> {
    const schedule = await this.findScheduleByIdAndUser(scheduleId, userId);
    if (schedule.status !== ScheduleStatus.PAUSED) {
      throw new BadRequestException('Only paused schedules can be resumed');
    }

    schedule.status = ScheduleStatus.ACTIVE;
    schedule.pauseReason = undefined;

    const config: ScheduleConfig = {
      frequency: schedule.frequency,
      hour: schedule.hour as number,
      minute: schedule.minute as number,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      customIntervalDays: schedule.customIntervalDays,
    };

    schedule.nextRunDate = this.timeService.calculateNextRunDate(
      new Date(),
      config,
    );

    return this.scheduleRepository.save(schedule);
  }

  async markScheduleAsRun(
    scheduleId: string,
    success: boolean,
  ): Promise<RecurringSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    schedule.lastRunDate = new Date();

    if (success) {
      schedule.successfulRuns += 1;
      schedule.consecutiveFailures = 0;

      const config: ScheduleConfig = {
        frequency: schedule.frequency,
        hour: schedule.hour as number,
        minute: schedule.minute as number,
        dayOfWeek: schedule.dayOfWeek,
        dayOfMonth: schedule.dayOfMonth,
        customIntervalDays: schedule.customIntervalDays,
      };

      schedule.nextRunDate = this.timeService.calculateNextRunDate(
        schedule.lastRunDate,
        config,
      );

      if (schedule.endDate && schedule.nextRunDate > schedule.endDate) {
        schedule.status = ScheduleStatus.COMPLETED;
      }
    } else {
      schedule.failedRuns += 1;
      schedule.consecutiveFailures += 1;

      if (schedule.hasReachedMaxFailures()) {
        schedule.status = ScheduleStatus.PAUSED;
        schedule.pauseReason = 'Automatically paused due to repeated failures';
      }
    }

    return this.scheduleRepository.save(schedule);
  }

  async getUserSchedules(
    userId: string,
    status?: ScheduleStatus,
  ): Promise<RecurringSchedule[]> {
    const where: FindOptionsWhere<RecurringSchedule> = { userId };
    if (status) {
      where.status = status;
    }

    return this.scheduleRepository.find({
      where,
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelSchedule(
    scheduleId: string,
    userId: string,
  ): Promise<RecurringSchedule> {
    const schedule = await this.findScheduleByIdAndUser(scheduleId, userId);
    schedule.status = ScheduleStatus.CANCELLED;
    return this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(scheduleId: string, userId: string): Promise<void> {
    const schedule = await this.findScheduleByIdAndUser(scheduleId, userId);
    if (schedule.status !== ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Only cancelled schedules can be deleted');
    }

    await this.scheduleRepository.remove(schedule);
  }

  async getDueSchedules(): Promise<{
    schedules: RecurringSchedule[];
    total: number;
  }> {
    const now = this.timeService.getNigeriaTime();
    const [schedules, total] = await this.scheduleRepository.findAndCount({
      where: {
        nextRunDate: LessThanOrEqual(now),
        status: ScheduleStatus.ACTIVE,
      },
      order: { nextRunDate: 'ASC' },
      take: 100,
      relations: ['user', 'recipient'],
    });

    return { schedules, total };
  }

  async getScheduleById(
    scheduleId: string,
    userId: string,
  ): Promise<RecurringSchedule> {
    return this.findScheduleByIdAndUser(scheduleId, userId);
  }

  async getScheduleStats(userId: string): Promise<{
    total: number;
    active: number;
    paused: number;
    totalAmountScheduled: number;
    successRate: number;
  }> {
    const schedules = await this.getUserSchedules(userId);

    const stats = {
      total: schedules.length,
      active: schedules.filter((s) => s.status === ScheduleStatus.ACTIVE)
        .length,
      paused: schedules.filter((s) => s.status === ScheduleStatus.PAUSED)
        .length,
      totalAmountScheduled: schedules
        .filter((s) => s.isActive())
        .reduce((sum, s) => sum + Number(s.amount), 0),
      successRate: 0,
    };

    const totalRuns = schedules.reduce((sum, s) => sum + s.getTotalRuns(), 0);
    const successfulRuns = schedules.reduce(
      (sum, s) => sum + s.successfulRuns,
      0,
    );

    if (totalRuns > 0) {
      stats.successRate = (successfulRuns / totalRuns) * 100;
    } else {
      stats.successRate = 100;
    }

    return stats;
  }
}
