import {
  advertisementReachAndClickCountCron,
  advertisementStatusCron,
} from '../modules/advertisement/advertisement.cron';

export function startCrons() {
  advertisementStatusCron();
  advertisementReachAndClickCountCron();
}
