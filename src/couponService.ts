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

  verifyCoupon(code: string, userId?: string): { isValid: boolean; statusCode: number; message: string } {
    if (!this.coupons[code]) {
      return { isValid: false, statusCode: 404, message: "Coupon not found" };
    }

    const coupon = this.coupons[code];


    // Check global usage limit
    const globalLimitConfig = coupon.repeatCountConfigs.find(config => config.countType === RepeatCountType.GLOBAL_TOTAL);
    if (globalLimitConfig && coupon.usageCount >= globalLimitConfig.limit) {
      return { isValid: false, statusCode: 400, message: "Coupon global usage limit reached" };
    }

    if (userId) {
      const userUsage = coupon.userUsage[userId] || { total: 0 };

      // Check user total limit
      const userTotalLimitConfig = coupon.repeatCountConfigs.find(config => config.countType === RepeatCountType.USER_TOTAL);
      if (userTotalLimitConfig && userUsage.total >= userTotalLimitConfig.limit) {
        return { isValid: false, statusCode: 400, message: "User has reached the total usage limit for this coupon" };
      }

      // Check user daily limit
      const userDailyLimitConfig = coupon.repeatCountConfigs.find(config => config.countType === RepeatCountType.USER_DAILY);
      if (userDailyLimitConfig) {
        const today = new Date().toISOString().split('T')[0];
        if ((userUsage[today] || 0) >= userDailyLimitConfig.limit) {
          return { isValid: false, statusCode: 400, message: "User has reached the daily usage limit for this coupon" };
        }
      }

      // Check user weekly limit
      const userWeeklyLimitConfig = coupon.repeatCountConfigs.find(config => config.countType === RepeatCountType.USER_WEEKLY);
      if (userWeeklyLimitConfig) {
        const thisWeek = `week_${this.getWeekNumber(new Date())}`;
        if ((userUsage[thisWeek] || 0) >= userWeeklyLimitConfig.limit) {
          return { isValid: false, statusCode: 400, message: "User has reached the weekly usage limit for this coupon" };
        }
      }
    }

    return { isValid: true, statusCode: 200, message: "Coupon is valid" };
  }

  applyCoupon(code: string, userId?: string): boolean {
    const verificationResult = this.verifyCoupon(code, userId);
    if (!verificationResult.isValid) return false;

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

      const thisWeek = `week_${this.getWeekNumber(new Date())}`;
      userUsage[thisWeek] = (userUsage[thisWeek] || 0) + 1;
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
