import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();
import { Channels } from "../routes/pubsub.js";

const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

subscriber.subscribe(Channels.NOTIFICATIONS, (err) => {
    if (err) {
        console.log("failed to subscribe!");
        return
    }
    console.log("subscribed succesfully!");
})

subscriber.on("message", (channel, message) => {
    console.log("message recieved on channel", channel, ": ", JSON.parse(message));
})