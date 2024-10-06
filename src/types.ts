export enum RepeatCountType {
  GLOBAL_TOTAL = "global_total",
  USER_TOTAL = "user_total",
  USER_DAILY = "user_daily",
  USER_WEEKLY = "user_weekly",
}

export interface RepeatCountConfig {
  countType: RepeatCountType;
  limit: number;
}

export interface CouponCode {
  code: string;
  repeatCountConfigs: RepeatCountConfig[];
  usageCount: number;
  userUsage: Record<string, Record<string, number>>;
}
