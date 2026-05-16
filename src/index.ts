import { Redis } from "ioredis";
import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.get("/ping-redis", async (req: Request, res: Response): Promise<void> => {
    try {
        const reply = await redis.ping()
        res.json({ reply: reply })
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})