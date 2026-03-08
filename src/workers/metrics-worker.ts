import { startMetricsWorker } from "@/lib/queue";

const worker = startMetricsWorker();

if (!worker) {
  console.log("REDIS_URL is not set. Worker is disabled and jobs run inline.");
  process.exit(0);
}

worker.on("ready", () => {
  console.log("CustomerAtlas metrics worker is running.");
});

worker.on("failed", (job, error) => {
  console.error("Metrics job failed", { jobId: job?.id, error: error.message });
});

worker.on("error", (error) => {
  console.error("Metrics worker connection error", { error: error.message });
});
