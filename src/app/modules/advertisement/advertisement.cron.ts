import cron from 'node-cron';
import { Advertisement } from './advertisement.model';
import {
  AD_STATUS,
  PAYMENT_STATUS,
  APPROVAL_STATUS,
} from './advertisement.constants';
import { redis } from '../../../config/redis';

export const advertisementStatusCron = () => {
  // Runs every 5 minute
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();

    try {
      // 1️⃣ ACTIVATE ADS
      const activateResult = await Advertisement.updateMany(
        {
          status: AD_STATUS.Pending,
          paymentStatus: PAYMENT_STATUS.Paid,
          approvalStatus: APPROVAL_STATUS.Approved,
          startAt: { $lte: now },
          endAt: { $gt: now },
          isDeleted: false,
        },
        {
          $set: { status: AD_STATUS.Active },
        },
      );

      // 2️⃣ DEACTIVATE ADS
      const deactivateResult = await Advertisement.updateMany(
        {
          status: AD_STATUS.Active,
          endAt: { $lte: now },
          isDeleted: false,
        },
        {
          $set: { status: AD_STATUS.Inactive },
        },
      );

      if (activateResult.modifiedCount || deactivateResult.modifiedCount) {
        console.log(
          `[CRON] Ads activated: ${activateResult.modifiedCount}, Ads deactivated: ${deactivateResult.modifiedCount}`,
        );
      }
    } catch (error) {
      console.error('[CRON] Advertisement status update failed:', error);
    }
  });
};

// track reach count and click count
export const advertisementReachAndClickCountCron = () => {
  // Runs every 5 minute
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Advertisement reach and click count update started...');
    try {
      const ads = await Advertisement.find({
        status: AD_STATUS.Active,
        endAt: { $gt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes from now
      });

      for (const ad of ads) {
        const reachKey = `advertisement:reach:${ad._id}`;
        const clickKey = `advertisement:clicks:${ad._id}`;

        const reachCount = await redis.scard(reachKey);
        const clickCount = Number(await redis.get(clickKey)) || 0;
        console.log(reachCount, clickCount);

        await Advertisement.findByIdAndUpdate(ad._id, {
          $inc: {
            reachCount,
            clickCount,
          },
        });

        // Optional cleanup
        await redis.del(clickKey);
        // await redis.del(reachKey);
      }
      console.log(
        '[CRON] Advertisement reach and click count update completed',
      );
    } catch (error) {
      console.error(
        '[CRON] Advertisement reach and click count update failed:',
        error,
      );
    }
  });
};
