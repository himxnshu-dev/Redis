import { Router } from "express";
import { redis } from "../lib/redis.js";
import { Request, Response } from "express";

const enum QueueKey {
    QUEUE_KEY = "queue:email"
}

// implementing a simple email queue using redis list. The email job will be added to the left of the list (queue) and the worker will pop the job from the right of the list (queue) to process it. This way we can ensure that the jobs are processed in the order they were added to the queue (FIFO - First In First Out).
export const emailRouter = (): Router => {
    const router = Router()

    // again, this is just a simulation of an email job. In a real-world scenario, you would have a worker process that continuously polls the queue for new jobs and processes them (e.g., sending emails using an email service provider). Here, we are just simulating the addition of email jobs to the queue and processing one job at a time through API endpoints.
    router.post('/emails', async (req: Request, res: Response) => {
        try {
            if (!req.body || !Object.keys(req.body)) {
                return res.status(400).json({ msg: "request body should not be empty" })
            }
            const job = {
                to: req.body.to,
                subject: req.body.subject,
                body: req.body.body,
                createdAt: new Date().toLocaleTimeString()
            }

            await redis.lpush(QueueKey.QUEUE_KEY, JSON.stringify(job)) // lpush to add the job to the left of the list (queue)
            res.json({ msg: "email job added to queue", job })
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? {
                    message: err.message,
                    stack: err.stack
                } : "An unknown error occurred"
            })
        }
    })

    router.get('/emails/process-one', async (req: Request, res: Response) => {
        try {
            const rawJob = await redis.rpop(QueueKey.QUEUE_KEY) // rpop to get the oldest job in the queue
            if (!rawJob) {
                return res.status(404).json({ msg: "No email job in queue" })
            }
            const job = JSON.parse(rawJob);
            res.json({ msg: "email sent!", job })
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