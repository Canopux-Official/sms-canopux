import { Queue } from 'bullmq';

// We reuse the Redis connection URL, defaulting to local redis if none is provided.
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = {
  url: redisUrl,
};

export const emailQueue = new Queue('email-queue', { connection });

export const sendEmailJob = async (emailData: any) => {
  await emailQueue.add('send-email', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
