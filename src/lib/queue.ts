import { Queue, Worker } from "bullmq";
import { generateInsights } from "@/lib/insights";
import { recomputeCustomerMetrics, rebuildSegmentsForShop } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";

type MetricsJob = {
  shopDomain: string;
  customerId?: number;
};

const queueName = "customer-metrics";
const ENQUEUE_MAX_ATTEMPTS = 3;

function buildJobId(job: MetricsJob): string {
  return job.customerId
    ? `${job.shopDomain}:customer:${job.customerId}`
    : `${job.shopDomain}:shop:all`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRedisConnectionOptions(): {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db?: number;
  maxRetriesPerRequest: null;
} | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(process.env.REDIS_URL);
  } catch {
    console.warn("Invalid REDIS_URL detected. Falling back to inline job processing.");
    return null;
  }

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: parsed.pathname ? Number(parsed.pathname.replace("/", "") || 0) : 0,
    maxRetriesPerRequest: null,
  };
}

const redisConnection = getRedisConnectionOptions();

const metricsQueue = redisConnection
  ? new Queue<MetricsJob>(queueName, { connection: redisConnection })
  : null;

if (metricsQueue) {
  metricsQueue.on("error", (error) => {
    console.warn(`BullMQ queue connection issue: ${error.message}`);
  });
}

export async function enqueueMetricsRecompute(job: MetricsJob): Promise<void> {
  if (!metricsQueue) {
    await processMetricsJob(job);
    return;
  }

  for (let attempt = 1; attempt <= ENQUEUE_MAX_ATTEMPTS; attempt += 1) {
    try {
      await metricsQueue.add("recompute", job, {
        jobId: buildJobId(job),
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      });
      return;
    } catch (error) {
      if (attempt === ENQUEUE_MAX_ATTEMPTS) {
        console.warn(
          `Unable to enqueue metrics job (${(error as Error).message}). Running inline fallback.`,
        );
        await processMetricsJob(job);
        return;
      }

      // Retry queue writes briefly for transient connection issues.
      await sleep(attempt * 500);
    }
  }
}

export async function processMetricsJob(job: MetricsJob): Promise<void> {
  if (job.customerId) {
    await recomputeCustomerMetrics(job.shopDomain, job.customerId);
  } else {
    const customers = await prisma.customer.findMany({
      where: { shopDomain: job.shopDomain },
      select: { id: true },
    });

    for (const customer of customers) {
      await recomputeCustomerMetrics(job.shopDomain, customer.id);
    }
  }

  await rebuildSegmentsForShop(job.shopDomain);
  await generateInsights(job.shopDomain);
}

export function startMetricsWorker(): Worker<MetricsJob> | null {
  if (!redisConnection) {
    return null;
  }

  const worker = new Worker<MetricsJob>(
    queueName,
    async (bullJob) => {
      await processMetricsJob(bullJob.data);
    },
    { connection: redisConnection },
  );

  worker.on("error", (error) => {
    console.warn(`BullMQ worker connection issue: ${error.message}`);
  });

  return worker;
}
