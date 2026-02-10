import { ConnectionOptions } from "bullmq";

// BullMQ
export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};

export const concurrency = 10;
