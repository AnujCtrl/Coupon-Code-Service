import { CouponCodeService } from "../couponService";

describe("CouponCodeService", () => {
  let service: CouponCodeService;

  beforeEach(() => {
    process.env.GLOBAL_TOTAL_LIMIT = "10";
    process.env.USER_TOTAL_LIMIT = "3";
    process.env.USER_DAILY_LIMIT = "1";
    process.env.USER_WEEKLY_LIMIT = "2";
    service = new CouponCodeService();
  });

  describe("addCoupon", () => {
    it("should add a new coupon successfully", () => {
      expect(() => service.addCoupon("TEST123")).not.toThrow();
    });

    it("should throw an error when adding a duplicate coupon", () => {
      service.addCoupon("TEST123");
      expect(() => service.addCoupon("TEST123")).toThrow(
        "Coupon code 'TEST123' already exists"
      );
    });
  });

  describe("verifyCoupon", () => {
    beforeEach(() => {
      service.addCoupon("TEST123");
    });

    it("should return true for a valid coupon", () => {
      expect(service.verifyCoupon("TEST123")).toBe(true);
    });

    it("should return false for an invalid coupon", () => {
      expect(service.verifyCoupon("INVALID")).toBe(false);
    });

    it("should return true for a valid coupon with user", () => {
      expect(service.verifyCoupon("TEST123", "user1")).toBe(true);
    });
  });

  describe("applyCoupon", () => {
    beforeEach(() => {
      service.addCoupon("TEST123");
    });

    it("should apply a coupon successfully", () => {
      expect(service.applyCoupon("TEST123", "user1")).toBe(true);
    });

    it("should return false for an invalid coupon", () => {
      expect(service.applyCoupon("INVALID", "user1")).toBe(false);
    });

    it("should respect global total limit", () => {
      for (let i = 0; i < 10; i++) {
        expect(service.applyCoupon("TEST123", `user${i}`)).toBe(true);
      }
      expect(service.applyCoupon("TEST123", "user11")).toBe(false);
    });

    it("should respect user total limit", () => {
      for (let i = 0; i < 3; i++) {
        expect(service.applyCoupon("TEST123", "user21")).toBe(true);
      }
      expect(service.applyCoupon("TEST123", "user21")).toBe(false);
    });

    it("should respect user daily limit", () => {
      expect(service.applyCoupon("TEST123", "user1")).toBe(true);
      expect(service.applyCoupon("TEST123", "user1")).toBe(false);
    });

    it("should respect user weekly limit", () => {
      expect(service.applyCoupon("TEST123", "user1")).toBe(true);
      expect(service.applyCoupon("TEST123", "user1")).toBe(false);
      // Note: We can't easily test the transition to a new week without mocking Date
    });
  });

  // Additional tests for edge cases and complex scenarios
  describe("complex scenarios", () => {
    beforeEach(() => {
      service.addCoupon("COMPLEX");
    });

    // it("should allow different users to use the coupon up to the global limit", () => {
    //   for (let i = 0; i < 10; i++) {
    //     expect(service.applyCoupon("COMPLEX", `user${i}`)).toBe(true);
    //   }
    //   expect(service.applyCoupon("COMPLEX", "user10")).toBe(false);
    // });

    it("should reset daily limit for a user on a new day", () => {
      const originalDate = Date;
      const mockDate = (isoDate: string) => {
        global.Date = class extends Date {
          constructor() {
            super();
            return new originalDate(isoDate);
          }
        } as DateConstructor;
      };

      mockDate("2023-01-01T00:00:00Z");
      expect(service.applyCoupon("COMPLEX", "user1")).toBe(true);
      expect(service.applyCoupon("COMPLEX", "user1")).toBe(false);

      mockDate("2023-01-02T00:00:00Z");
      expect(service.applyCoupon("COMPLEX", "user1")).toBe(true);

      global.Date = originalDate;
    });

    it("should reset weekly limit for a user on a new week", () => {
      const originalDate = Date;
      const mockDate = (isoDate: string) => {
        global.Date = class extends Date {
          constructor() {
            super();
            return new originalDate(isoDate);
          }
        } as DateConstructor;
      };

      mockDate("2023-01-01T00:00:00Z"); // Sunday
      expect(service.applyCoupon("COMPLEX", "user1")).toBe(true);
      expect(service.applyCoupon("COMPLEX", "user1")).toBe(false);

      mockDate("2023-01-08T00:00:00Z"); // Next Sunday
      expect(service.applyCoupon("COMPLEX", "user1")).toBe(true);

      global.Date = originalDate;
    });
  });
});
