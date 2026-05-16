import { Request, Response } from "express";
import { redis } from "../redis.js";
import { Router } from "express";

export const userProfileRouter = (): Router => {
    const router = Router()

    router.route('/user/:id/json')
        .post(async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                if (!req.body) {
                    return res.status(400).json({
                        msg: "request body should not be empty"
                    })
                }

                await redis.set(`user:${id}:json`, JSON.stringify(req.body))
                res.json({ savedAs: "json" })
            } catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? {
                        message: error.message,
                        stack: error.stack
                    } : "An unknown error occurred"
                })
            }
        })
        .get(async (req: Request, res: Response) => {
            try {
                const { id } = req.params
                const user = await redis.get(`user:${id}:json`)
                if (!user) {
                    res.status(400).json({
                        msg: "user profile not found!"
                    })
                    return;
                }

                res.json({
                    user: user ? JSON.parse(user) : null
                })
            } catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? {
                        message: error.message,
                        stack: error.stack
                    } : "An unknown error occurred"
                })
            }
        })

    return router;
}