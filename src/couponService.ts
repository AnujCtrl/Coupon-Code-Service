import { RepeatCountType, RepeatCountConfig, CouponCode } from "./types";

export class CouponCodeService {
  private coupons: Record<string, CouponCode> = {};

  constructor() {
    this.coupons = {};
  }

  addCoupon(code: string): void {
    if (this.coupons[code]) {
      throw new Error(`Coupon code '${code}' already exists`);
    }
    this.coupons[code] = {
      code,
      repeatCountConfigs: [
        {
          countType: RepeatCountType.GLOBAL_TOTAL,
          limit: Number(process.env.GLOBAL_TOTAL_LIMIT),
        },
        {
          countType: RepeatCountType.USER_TOTAL,
          limit: Number(process.env.USER_TOTAL_LIMIT),
        },
        {
          countType: RepeatCountType.USER_DAILY,
          limit: Number(process.env.USER_DAILY_LIMIT),
        },
        {
          countType: RepeatCountType.USER_WEEKLY,
          limit: Number(process.env.USER_WEEKLY_LIMIT),
        },
      ],
      usageCount: 0,
      userUsage: {},
    };
    this.printCouponStatus(code);
  }

  verifyCoupon(code: string, userId?: string): boolean {
    const coupon = this.coupons[code];
    if (!coupon) return false;

    const globalConfig = coupon.repeatCountConfigs.find(
      (config) => config.countType === RepeatCountType.GLOBAL_TOTAL
    );
    if (globalConfig && coupon.usageCount >= globalConfig.limit) {
      return false;
    }

    if (userId) {
      const userUsage = coupon.userUsage[userId] || {};
      for (const config of coupon.repeatCountConfigs) {
        switch (config.countType) {
          case RepeatCountType.USER_TOTAL:
            if ((userUsage.total || 0) >= config.limit) return false;
            break;
          case RepeatCountType.USER_DAILY:
            const today = new Date().toISOString().split("T")[0];
            if ((userUsage[today] || 0) >= config.limit) return false;
            break;
          case RepeatCountType.USER_WEEKLY:
            const thisWeek = this.getWeekNumber(new Date());
            if ((userUsage[`week_${thisWeek}`] || 0) >= config.limit)
              return false;
            break;
        }
      }
    }

    return true;
  }

  applyCoupon(code: string, userId?: string): boolean {
    if (!this.verifyCoupon(code, userId)) return false;

    const coupon = this.coupons[code];
    coupon.usageCount++; 

    if (userId) {
      if (!coupon.userUsage[userId]) {
        coupon.userUsage[userId] = { total: 0 };
      }
      const userUsage = coupon.userUsage[userId];
      userUsage.total = (userUsage.total || 0) + 1;

      const today = new Date().toISOString().split("T")[0];
      userUsage[today] = (userUsage[today] || 0) + 1;

      const thisWeek = this.getWeekNumber(new Date());
      userUsage[`week_${thisWeek}`] = (userUsage[`week_${thisWeek}`] || 0) + 1;
    }

    this.printCouponStatus(code);
    return true;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private printCouponStatus(code: string): void {
    const coupon = this.coupons[code];
    console.log(`\nCoupon Status for ${code}:`);
    console.log(`Global Usage: ${coupon.usageCount}`);
    console.log("User Usage:");
    Object.entries(coupon.userUsage).forEach(([userId, usage]) => {
      console.log(`  User ${userId}:`);
      Object.entries(usage).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    });
  }
}
