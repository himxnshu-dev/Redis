import { Request, Response, Router } from "express";
import { Redis } from "ioredis";

export enum Channels {
    NOTIFICATIONS = "notifications"
}

export const publishRouter = (): Router => {
    const router = Router()

    const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

    router.post('/notification', async (req: Request, res: Response) => {
        try {
            const payload = {
                title: req.body.title || "default",
                createdAt: new Date().toLocaleTimeString()
            }
            await publisher.publish(Channels.NOTIFICATIONS, JSON.stringify(payload))
            res.status(200).json({ message: "notification published!" })
        } catch (err) {
            res.status(500).json({ message: "failed to publish notification!", err })
        }
    })

    return router
}