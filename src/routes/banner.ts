import {  Router } from 'express';
import { Request, Response } from 'express';
import { redis } from '../redis.js';

const enum Banner {
    BANNER_KEY = "app:banner"
}

// one of the simplest use cases for redis is to store a banner message for an app. This message can be updated, retrieved, or deleted as needed.
export const bannerRouter = (): Router => {
    const router = Router();

    router.route('/banner')
    .post(async (req: Request, res: Response): Promise<void> => {
        try {
            await redis.set(Banner.BANNER_KEY, req.body.message || "welcome to the app!");
            res.json({ success: true });
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(500).json({ error: "An unknown error occurred" });
            }
        }
    })
    .get(async (_req: Request, res: Response): Promise<void> => {
        try {
            const message = await redis.get(Banner.BANNER_KEY);
            if (!message) {
                res.status(404).json({ error: "No banner message found" });
                return;
            }
            res.json({ message });
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? err.message : "An unknown error occurred"
            })
        }
    })
    .delete(async (req: Request, res: Response) => {
        try {
            await redis.del(Banner.BANNER_KEY)
            res.sendStatus(204)
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? err.message : "An unknown error occurred"
            })
        }
    })

    router.get('/banner/exists', async (_req: Request, res: Response) => {
        try {
            const exists = await redis.exists(Banner.BANNER_KEY);
            res.status(200).json({exists: Boolean(exists)});
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? err.message : "An unknown error occurred"
            })
        }
    })

    return router;
}