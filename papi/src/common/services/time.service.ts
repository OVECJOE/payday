import { ScheduleFrequency } from '@/modules/schedule/entities/recurring-schedule.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  isBefore,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setDate,
  isSameDay,
} from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  minute: number;
  customIntervalDays?: number;
}

@Injectable()
export class TimeService {
  private readonly defaultTimeZone: string;
  private readonly nigeriaTimezone = 'Africa/Lagos';

  constructor(private configService: ConfigService) {
    this.defaultTimeZone = this.configService.get<string>(
      'DEFAULT_TIMEZONE',
      this.nigeriaTimezone,
    );
  }

  getNigeriaTime(): Date {
    return toZonedTime(new Date(), this.nigeriaTimezone);
  }

  getUserLocalTime(timezone?: string): Date {
    const tz = timezone || this.defaultTimeZone;
    return toZonedTime(new Date(), tz);
  }

  convertToNigeriaTime(date: Date, timezone?: string): Date {
    const nigeriaZoned = toZonedTime(date, timezone || this.nigeriaTimezone);
    return fromZonedTime(nigeriaZoned, this.nigeriaTimezone);
  }

  convertFromNigeriaTime(date: Date, targetTimezone: string): Date {
    const nigeriaZoned = toZonedTime(date, this.nigeriaTimezone);
    return fromZonedTime(nigeriaZoned, targetTimezone);
  }

  formatForUser(date: Date, timezone?: string, formatStr = 'PPpp'): string {
    return formatInTimeZone(date, timezone || this.defaultTimeZone, formatStr);
  }

  parseUserDateTime(dateStr: string, timezone?: string): Date {
    const tz = timezone || this.defaultTimeZone;
    return fromZonedTime(parseISO(dateStr), tz);
  }

  calculateNextRunDate(
    lastRun: Date,
    config: ScheduleConfig,
    userTimezone?: string,
  ): Date {
    const tz = userTimezone || this.defaultTimeZone;
    const lastRunInUserTz = toZonedTime(lastRun, tz);

    let nextRun: Date;
    switch (config.frequency) {
      case ScheduleFrequency.DAILY:
        nextRun = addDays(lastRunInUserTz, 1);
        break;
      case ScheduleFrequency.WEEKLY:
        nextRun = addWeeks(lastRunInUserTz, 1);
        if (config.dayOfWeek !== undefined) {
          const currentDay = nextRun.getDay();
          const daysToAdd = (config.dayOfWeek - currentDay + 7) % 7;
          nextRun = addDays(nextRun, daysToAdd);
        }
        break;
      case ScheduleFrequency.MONTHLY:
        nextRun = addMonths(lastRunInUserTz, 1);
        if (config.dayOfMonth !== undefined) {
          const daysInMonth = new Date(
            nextRun.getFullYear(),
            nextRun.getMonth() + 1,
            0,
          ).getDate();
          const targetDay = Math.min(config.dayOfMonth, daysInMonth);
          nextRun = setDate(nextRun, targetDay);
        }
        break;
      case ScheduleFrequency.CUSTOM:
        if (!config.customIntervalDays) {
          throw new Error('Custom interval days required for custom frequency');
        }
        nextRun = addDays(lastRunInUserTz, config.customIntervalDays);
        break;
      default:
        throw new Error(`Unsupported frequency: ${config.frequency as string}`);
    }

    nextRun = setHours(nextRun, config.hour);
    nextRun = setMinutes(nextRun, config.minute);
    nextRun = setSeconds(nextRun, 0);

    return fromZonedTime(nextRun, tz);
  }

  getStartOfDayInNigeria(date?: Date): Date {
    const nigeriaDate = toZonedTime(date || new Date(), this.nigeriaTimezone);
    return startOfDay(nigeriaDate);
  }

  getEndOfDayInNigeria(date?: Date): Date {
    const nigeriaDate = toZonedTime(date || new Date(), this.nigeriaTimezone);
    return endOfDay(nigeriaDate);
  }

  isPaymentDue(scheduledTime: Date): boolean {
    const now = this.getNigeriaTime();
    return isBefore(scheduledTime, now) || isSameDay(scheduledTime, now);
  }

  isWithinExecutionWindow(scheduledTime: Date, windowMinutes = 5): boolean {
    const now = this.getNigeriaTime();
    const minutesDiff = Math.abs(differenceInMinutes(now, scheduledTime));
    return minutesDiff <= windowMinutes;
  }

  getTimezoneOffset(timezone: string): string {
    return formatInTimeZone(new Date(), timezone, 'XXX');
  }

  validateTimezone(timezone: string): boolean {
    try {
      formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
      return true;
    } catch {
      return false;
    }
  }

  getDaysBetween(startDate: Date, endDate: Date): number {
    return differenceInDays(endDate, startDate);
  }

  getHoursBetween(startDate: Date, endDate: Date): number {
    return differenceInHours(endDate, startDate);
  }

  addBusinessDays(date: Date, days: number, timezone?: string): Date {
    const tz = timezone || this.defaultTimeZone;
    let currentDate = toZonedTime(date, tz);
    let addedDays = 0;

    while (addedDays < days) {
      currentDate = addDays(currentDate, 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    return fromZonedTime(currentDate, tz);
  }

  isBusinessDay(date: Date, timezone?: string): boolean {
    const tz = timezone || this.defaultTimeZone;
    const zonedDate = toZonedTime(date, tz);
    const dayOfWeek = zonedDate.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  createScheduleFromUserInput(
    startDate: string,
    frequency: ScheduleFrequency,
    hour: number,
    minute: number,
    userTimezone?: string,
    additionalConfig?: Partial<ScheduleConfig>,
  ): { startDate: Date; config: ScheduleConfig } {
    const tz = userTimezone || this.defaultTimeZone;
    const parsedStartDate = this.parseUserDateTime(startDate, tz);

    const config: ScheduleConfig = {
      frequency,
      hour,
      minute,
      ...additionalConfig,
    };

    return {
      startDate: parsedStartDate,
      config,
    };
  }

  getNextBusinessDay(date?: Date, timezone?: string): Date {
    const tz = timezone || this.defaultTimeZone;
    let currentDate = date ? toZonedTime(date, tz) : this.getUserLocalTime(tz);

    do {
      currentDate = addDays(currentDate, 1);
    } while (!this.isBusinessDay(currentDate, tz));

    return fromZonedTime(currentDate, tz);
  }
}
