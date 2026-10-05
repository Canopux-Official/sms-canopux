import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = {
  url: redisUrl,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { to, subject, html, from } = job.data;
    
    console.log(`[EmailWorker] Sending email to ${to}...`);
    
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[EmailWorker] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`[EmailWorker] Failed to send email to ${to}:`, error);
      throw error; // Re-throw so BullMQ knows it failed and can retry
    }
  },
  { connection }
);

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err);
});
