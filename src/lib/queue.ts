import { Queue, Worker } from "bullmq";
import { generateInsights } from "@/lib/insights";
import { recomputeCustomerMetrics, rebuildSegmentsForShop } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";

type MetricsJob = {
  shopDomain: string;
  customerId?: number;
};

const queueName = "customer-metrics";

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

const metricsQueue = redisConnection ? new Queue<MetricsJob>(queueName, { connection: redisConnection }) : null;

export async function enqueueMetricsRecompute(job: MetricsJob): Promise<void> {
  if (!metricsQueue) {
    await processMetricsJob(job);
    return;
  }

  await metricsQueue.add("recompute", job, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });
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

  return new Worker<MetricsJob>(
    queueName,
    async (bullJob) => {
      await processMetricsJob(bullJob.data);
    },
    { connection: redisConnection },
  );
}
