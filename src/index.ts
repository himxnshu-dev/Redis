import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Request, Response } from "express";
import { redis } from "./lib/redis.js";
import { bannerRouter } from "./routes/banner.js";
import { otpRouter } from "./routes/otp.js";
import { userProfileRouter } from "./routes/user-profile.js";
import { emailRouter } from "./routes/emails.js";
import { queueEmailsRouter } from "./routes/emailsQ.js";
import { publishRouter } from "./routes/pubsub.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { postsRouter } from "./routes/posts.js";

const app = express();

app.use(express.json());

app.get("/ping-redis", async (req: Request, res: Response): Promise<void> => {
    try {
        const reply = await redis.ping()
        res.json({ reply: reply })
    } catch (err) {
        res.status(500).json({ error: "Error connecting to Redis" })
    }
})

// api routes
app.use("/api", bannerRouter());
app.use("/api", postsRouter());
app.use("/api", otpRouter());
app.use('/api', userProfileRouter())
app.use("/api", emailRouter());
app.use("/api", queueEmailsRouter());
app.use("/api", publishRouter());
app.use('/api', leaderboardRouter())

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})