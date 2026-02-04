import cron from 'node-cron';
import { Advertisement } from './advertisement.model';
import {
  AD_STATUS,
  PAYMENT_STATUS,
  APPROVAL_STATUS,
} from './advertisement.constants';

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
