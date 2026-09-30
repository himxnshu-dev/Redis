import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Request, Response } from "express";
import { redis } from "./lib/redis.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/ping-redis", async (_req: Request, res: Response): Promise<void> => {
    try {
        const reply = await redis.ping()
        res.json({ reply: reply })
    } catch (err) {
        res.status(500).json({ error: "Error connecting to Redis" })
    }
})

// api routes
app.use("/api", apiRouter());

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})
