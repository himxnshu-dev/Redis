import { Router } from "express";
import { bannerRouter } from "./banner.js";
import { emailRouter } from "./emails.js";
import { queueEmailsRouter } from "./emailsQ.js";
import { leaderboardRouter } from "./leaderboard.js";
import { otpRouter } from "./otp.js";
import { postsRouter } from "./posts.js";
import { publishRouter } from "./pubsub.js";
import { userProfileRouter } from "./user-profile.js";

export const apiRouter = (): Router => {
    const router = Router()

    router.use(bannerRouter())
    router.use(postsRouter())
    router.use(otpRouter())
    router.use(userProfileRouter())
    router.use(emailRouter())
    router.use(queueEmailsRouter())
    router.use(publishRouter())
    router.use(leaderboardRouter())

    return router;
}
