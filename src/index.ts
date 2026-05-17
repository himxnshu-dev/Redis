import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Request, Response } from "express";
import { redis } from "./redis.js";
import { bannerRouter } from "./routes/banner.js";
import { otpRouter } from "./routes/otp.js";
import { userProfileRouter } from "./routes/user-profile.js";
import { emailRouter } from "./routes/emails.js";

const app = express();

app.use(express.json());

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

// api routes
app.use("/api", bannerRouter());
app.use("/api", otpRouter());
app.use('/api', userProfileRouter())
app.use("/api", emailRouter());

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})