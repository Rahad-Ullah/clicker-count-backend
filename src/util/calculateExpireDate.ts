import { PLAN_NAME } from '../app/modules/plan/plan.constants';

export const calculateExpireDate = (
  interval: PLAN_NAME,
  intervalCount: number,
  baseDate: Date,
): Date => {
  if (!Number.isInteger(intervalCount) || intervalCount <= 0) {
    throw new Error('intervalCount must be a positive integer');
  }
  const result = new Date(new Date(baseDate).getTime()); // clone

  switch (interval) {
    case PLAN_NAME.Weekly:
      result.setDate(result.getDate() + intervalCount * 7);
      return result;

    case PLAN_NAME.Monthly:
      result.setMonth(result.getMonth() + intervalCount);
      return result;

    default:
      throw new Error(`Unsupported plan interval: ${interval}`);
  }
};
