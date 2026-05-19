import { redis } from "../lib/redis.js";
import { Router, Request, Response } from "express";

export function postsRouter(): Router {
    const router = Router();

    router.get('/posts', async (req: Request, res: Response): Promise<void> => {
        try {
            const cachedPosts = await redis.get("posts")
            if (cachedPosts) {
                res.status(200).json({
                    posts: JSON.parse(cachedPosts)
                })
                return;
            }

            const posts = await fetch("https://jsonplaceholder.typicode.com/posts")
                .then(response => response.json())
                // .then(data => data.slice(0, 10))
                .catch(err => {
                    throw new Error("Error fetching posts: " + err.message)
                })
            await redis.set("posts", JSON.stringify(posts), "EX", 30);

            res.status(200).json({
                posts: posts
            })
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? err.message : "An unknown error occurred"
            });
        }
    })
    router.get("/posts/ttl", async (req: Request, res: Response): Promise<void> => {
        try {
            const ttl = await redis.ttl("posts")
            res.status(200).json({ ttl: ttl })
        } catch (err) {
            res.status(500).json({
                error: err instanceof Error ? err.message : "An unknown error occurred"
            });
        }
    })

    return router;
}