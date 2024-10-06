import express from "express";
import dotenv from "dotenv";
import { CouponCodeService } from "./couponService";

dotenv.config();

const app = express();
app.use(express.json());

const couponService = new CouponCodeService();

app.post("/coupons", (req, res) => {
  try {
    const { code } = req.body;
    couponService.addCoupon(code);
    res.status(201).json({ message: "Coupon added successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

app.get("/coupons/:code/verify", (req, res) => {
  const { code } = req.params;
  const { userId } = req.query;
  const isValid = couponService.verifyCoupon(
    code,
    userId as string | undefined
  );
  res.json({ isValid });
});

app.post("/coupons/:code/apply", (req, res) => {
  const { code } = req.params;
  const { userId } = req.query;
  const applied = couponService.applyCoupon(code, userId as string | undefined);
  if (applied) {
    res.json({ message: "Coupon applied successfully" });
  } else {
    res.status(400).json({ error: "Unable to apply coupon" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
