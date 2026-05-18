import { emailQueue, queueName } from "../lib/queue.js";
import { Request, Response, Router } from "express";

export const queueEmailsRouter = (): Router => {
    const router = Router()

    router.post('/email/send', async (req: Request, res: Response) => {
        try {
            if (!req.body) {
                return res.json({ msg: "request body should not be empty" })
            }
            const jobData = {
                to: req.body.to,
                subject: req.body.subject,
                body: req.body.body
            }

            const job = await emailQueue.add(
                queueName,
                jobData,
                {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 3000
                    }
                })
            res.json({
                msg: "email job added to the queue",
                jobId: job.id
            })
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