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

                // const topPlayers: { userId: string; score: number }[] = []
                // for (let i = 0; i < topScorers.length; i += 2) {
                //     topPlayers.push({
                //         userId: topScorers[i] as string,
                //         score: Number(topScorers[i + 1])
                //     })
                // }
                const formattedTopScorers = topScorers.reduce((
                    result: { userId: string; score: number }[],
                    value,
                    index,
                    array
                ) => {
                    if (index % 2 === 0) {
                        result.push({
                            userId: value,
                            score: Number(array[index + 1])
                        })
                    }
                    return result;
                }, [])


                res.status(200).json({ topScorers: formattedTopScorers })
            } catch (err) {
                res.status(500).json({
                    msg: "An error occurred while fetching the leaderboard",
                    error: err instanceof Error ? err.message : "Unknown error"
                })
            }
        })

    router.get('/leaderboard/:userId/rank', async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.json({ msg: "invalid userId" })
            }

            const userRank = await redis.zrevrank(Leaderboard.SCORE, userId as string)
            if (userRank === null) {
                return res.status(404).json({
                    msg: "user not found in leaderboard"
                })
            }

            res.status(200).json({
                success: true,
                userRank: userRank + 1 // ranks are 0-indexed hence adding 1
            })
        } catch (err) {
            res.status(500).json({
                msg: "An error occurred while fetching the user rank",
                error: err instanceof Error ? err.message : "Unknown error"
            })
        }
    })

    return router;
}