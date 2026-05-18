import { Job, Worker } from "bullmq";
import { connection, queueName } from "./queue.js";

const emailWorker = new Worker(
    queueName,
    async (job: Job) => {
        console.log(`Processing job ${job.id} with data:`, job.data);
        // simulate email sending
        await new Promise((resolve) => setTimeout(resolve, 5000))
        console.log(`Email sent for job ${job.id}`);
    },
    { connection }
)

emailWorker.on('completed', (job: Job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`Job ${job?.id} failed with error:`, err);
});