import {  Router } from 'express';
import { Request, Response } from 'express';
import { redis } from '../redis.js';
import { sendOtp } from '../utils/sendOtp.js';

// another use case for redis is to store an OTP for a user. This OTP can be set with an expiration time (TTL) and can be retrieved or deleted as needed.
function otpKey(phone: string): string {
    return `otp:${phone}`;
}

export const otpRouter = (): Router => {
    const router = Router()

    router.route('/otp')
    .post(async (req: Request, res: Response): Promise<void> => {
        try {
            const { phone } = req.body;
            if (!phone) {
                res.status(400).json({ error: "phone number is required" });
                return;
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate a random 6-digit OTP
            await redis.set(otpKey(phone), otp, 'EX', 30); // set OTP with a TTL of 30 seconds

            await sendOtp(`Your OTP is: ${otp}`);

            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? {
                    message: err.message,
                    stack: err.stack
                } : "An unknown error occurred"
            })
        }
    })

    return router;
}