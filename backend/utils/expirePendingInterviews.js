import cron from "node-cron";
import InterviewSession from "../models/InterviewSessions.js";

/*
=====================================
AUTO EXPIRE PENDING INTERVIEWS (7 DAYS)
=====================================
*/

const startExpireJob = () => {

  // Run once every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {

      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      );

      const expired = await InterviewSession.updateMany(
        {
          status: "pending",
          createdAt: { $lt: sevenDaysAgo }
        },
        {
          $set: { status: "expired" }
        }
      );

      if (expired.modifiedCount > 0) {
        console.log(`Expired ${expired.modifiedCount} interviews`);
      }

    } catch (error) {
      console.log("Expire Job Error:", error);
    }
  });

};

export default startExpireJob;