import { env } from "./config/env.js";
import { app } from "./app.js";
import { startReferralScheduler } from "./services/referralScheduler.js";

startReferralScheduler();

app.listen(env.PORT, () => {
  console.log(`RealtyGenius API listening on http://localhost:${env.PORT}`);
});
