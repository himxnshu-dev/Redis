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

    router.post('/otp/verify', async (req: Request, res: Response): Promise<void> => {
        try {
            const { phone, otp } = req.body;
            if (!phone || !otp) {
                res.status(400).json({ error: "phone number and otp are required" });
                return;
            }

            const storedOtp = await redis.get(otpKey(phone))
            if (!storedOtp) {
                res.status(400).json({ error: "OTP has expired or does not exist" });
                return;
            }

            if (storedOtp !== otp) {
                res.status(400).json({ error: "Invalid OTP" });
                return;
            }
            
            await redis.del(otpKey(phone))
            res.status(200).json({ msg: "OTP verified successfully" });
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? {
                    message: err.message,
                    stack: err.stack
                } : "An unknown error occurred"
            })
        }
    })

    router.get('/otp/:phone/ttl', async (req: Request, res: Response): Promise<void> => {
        try {
            const { phone } = req.params;
            if (!phone) {
                res.status(400).json({
                    msg: "please input a valid phone number!"
                })
            }

            const ttl = await redis.ttl(otpKey(phone as string))
            res.status(200).json({ ttl })
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? {
                    msg: err.message,
                    stack: err.stack
                } : "an unknown error ocurred!"
            })
        }
    })

    return router;
}