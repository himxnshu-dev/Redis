import { Queue } from 'bullmq';

export const connection = {
    host: 'localhost',
    port: 6379,
}

export const queueName: string = 'emails';
export const emailQueue = new Queue(queueName, { connection })