import cron from "node-cron";
import { env } from "../config/env.js";
import { runReferralAutomation } from "./referralLifecycle.js";

let started = false;

export function startReferralScheduler() {
  if (started || !env.REFERRAL_CRON_ENABLED) return;
  started = true;

  cron.schedule(env.REFERRAL_CRON_SCHEDULE, async () => {
    try {
      const result = await runReferralAutomation();
      console.log(`Referral cron completed: ${result.draftedCount} campaigns drafted`);
    } catch (error) {
      console.error("Referral cron failed", error);
    }
  }, {
    timezone: "Asia/Kuala_Lumpur"
  });
}
