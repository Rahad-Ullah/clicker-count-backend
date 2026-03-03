import cron from 'node-cron';
import { Advertisement } from './advertisement.model';
import {
  AD_STATUS,
  PAYMENT_STATUS,
  APPROVAL_STATUS,
} from './advertisement.constants';
import { redis } from '../../../config/redis';
import { sendNotifications } from '../../../helpers/notificationHelper';

export const advertisementStatusCron = () => {
  // Runs every 5 minute
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();

    try {
      // 1. Fetch ads that need to be activated or deactivated
      const adsToActivate = await Advertisement.find({
        status: AD_STATUS.Pending,
        paymentStatus: PAYMENT_STATUS.Paid,
        approvalStatus: APPROVAL_STATUS.Approved,
        startAt: { $lte: now },
        endAt: { $gt: now },
        isDeleted: false,
      });

      const adsToDeactivate = await Advertisement.find({
        status: AD_STATUS.Active,
        endAt: { $lte: now },
        isDeleted: false,
      });

      // 2. Perform updates if there are documents
      if (adsToActivate.length > 0) {
        await Advertisement.updateMany(
          { _id: { $in: adsToActivate.map(a => a._id) } },
          { $set: { status: AD_STATUS.Active } },
        );
        // Trigger notifications for adsToActivate
        adsToActivate.forEach(ad => {
          sendNotifications({
            type: 'AD_ACTIVATED',
            title: 'Your advertisement has been started',
            message: `Your advertisement "${ad.title}" has been started.`,
            receiver: ad.user,
            referenceId: ad._id.toString(),
          });
        });
      }

      if (adsToDeactivate.length > 0) {
        await Advertisement.updateMany(
          { _id: { $in: adsToDeactivate.map(a => a._id) } },
          { $set: { status: AD_STATUS.Inactive } },
        );
        // Trigger notifications for adsToDeactivate
        adsToDeactivate.forEach(ad => {
          sendNotifications({
            type: 'AD_DEACTIVATED',
            title: 'Your advertisement has been ended',
            message: `Your advertisement "${ad.title}" has been ended.`,
            receiver: ad.user,
            referenceId: ad._id.toString(),
          });
        });
      }

      if (adsToActivate.length > 0 || adsToDeactivate.length > 0) {
        console.log(
          `[CRON] Ads activated: ${adsToActivate.length}, Ads deactivated: ${adsToDeactivate.length}`,
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
