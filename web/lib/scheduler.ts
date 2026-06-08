/**
 * BullMQ Job Scheduler
 * 
 * Registers two job queues:
 * 1. optimizerQueue: runs every 5 days at 2am
 * 2. robotArmQueue: processes robot arm jobs
 */

import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const ALGORITHM_SERVICE_URL = process.env.ALGORITHM_SERVICE_URL || 'http://localhost:8000';

let connection: IORedis | null = null;

function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  }
  return connection;
}

// ─── Optimizer Queue ────────────────────────────────────────────────────────

export function createOptimizerQueue() {
  const conn = getConnection();

  const queue = new Queue('optimizer', { connection: conn });

  // Register repeatable job: every 5 days at 2am
  queue.add(
    'scheduled-optimize',
    {},
    {
      repeat: { pattern: '0 2 */5 * *' },
      removeOnComplete: true,
      removeOnFail: 50,
    }
  );

  const worker = new Worker(
    'optimizer',
    async () => {
      console.log('[Scheduler] Running scheduled optimizer...');
      try {
        const res = await fetch(`${ALGORITHM_SERVICE_URL}/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        console.log('[Scheduler] Optimizer result:', data);
      } catch (error) {
        console.error('[Scheduler] Optimizer failed:', error);
        throw error;
      }
    },
    { connection: conn }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Scheduler] Job ${job?.id} failed:`, err.message);
  });

  console.log('✅ Optimizer queue registered (cron: 0 2 */5 * *)');
  return { queue, worker };
}

// ─── Robot Arm Queue ────────────────────────────────────────────────────────

export function createRobotArmQueue() {
  const conn = getConnection();

  const queue = new Queue('robot-arm', { connection: conn });

  const worker = new Worker(
    'robot-arm',
    async (job) => {
      const { jobId, jobType, plantId, toSpotId } = job.data;
      console.log(`[RobotArm] Processing ${jobType} job ${jobId}`);

      // Simulate robot arm work (in production, this would interface with real hardware)
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log(`[RobotArm] Completed ${jobType} job ${jobId}`);
    },
    {
      connection: conn,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[RobotArm] Job ${job?.id} failed:`, err.message);
  });

  console.log('✅ Robot arm queue registered');
  return { queue, worker };
}
