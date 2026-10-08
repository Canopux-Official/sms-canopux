import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL;

const connection = redisUrl ? { url: redisUrl } : undefined;

export const emailQueue = connection ? new Queue('email-queue', { connection }) : null;

export const sendEmailJob = async (emailData: any) => {
  if (!emailQueue) {
    console.warn('[EmailQueue] Redis not configured. Skipping BullMQ job.');
    return false;
  }
  await emailQueue.add('send-email', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
  return true;
};
