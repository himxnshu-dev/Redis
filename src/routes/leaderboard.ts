import { Request, Response, Router } from "express";
import { redis } from "../lib/redis.js";

function getViewKey(id: string): string {
    return `post:${id}:views`
}
enum Leaderboard {
    SCORE = "score"
}

// below are some common use cases of sorted sets in a leaderboard system, where we can update user scores and retrieve top scorers
export const leaderboardRouter = (): Router => {
    const router = Router()

    // endpoint to increment view count for a post
    router.post('/post/:id/view', async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) return res.json({
            msg: "invalid id, try again!"
        })

        const viewCount = await redis.incr(getViewKey(id as string))

        res.json({
            status: "view count updated",
            viewCount
        })
    })

    // endpoints to update user score and get top scorers
    router.route('/leadership/score')
        .post(async (req: Request, res: Response) => {
            const { userId, score } = req.body;
            if (!userId || score === null || isNaN(Number(score))) {
                return res.status(400).json({
                    msg: "invalid userId or score"
                })
            }

            const userScore = await redis.zincrby(Leaderboard.SCORE, Number(score), userId)

            res.status(200).json({
                status: "score updated",
                updatedScore: userScore
            })
        })
        .get(async (_req: Request, res: Response) => {
            try {
                const start: number = 0
                const stop: number = 4
                const topScorers = await redis.zrevrange(Leaderboard.SCORE, start, stop, "WITHSCORES")
    
                res.status(200).json({ topScorers })
            } catch (err) {
                res.status(500).json({
                    msg: "An error occurred while fetching the leaderboard",
                    error: err instanceof Error ? err.message : "Unknown error"
                })
            }
        })

    return router;
}