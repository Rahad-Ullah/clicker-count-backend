import { PAYMENT_STATUS } from '../advertisement/advertisement.constants';
import { Advertisement } from '../advertisement/advertisement.model';
import { USER_ROLES, USER_STATUS } from '../user/user.constant';
import { User } from '../user/user.model';

// ------------- get overview -------------
const getOverview = async () => {
  // get total users and advertisers and total earnings
  const [totalUsers, totalAdvertisers] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.USER, isDeleted: false }),
    User.countDocuments({ role: USER_ROLES.ADVERTISER, isDeleted: false }),
  ]);
  const totalEarnings = await Advertisement.aggregate([
    {
      $match: {
        isDeleted: false,
        paymentStatus: PAYMENT_STATUS.Paid,
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$price' },
      },
    },
  ]);

  return {
    totalUsers,
    totalAdvertisers,
    totalEarnings: totalEarnings[0]?.totalEarnings || 0,
  };
};

// get monthly user growth
const getMonthlyUserGrowth = async (query: Record<string, unknown>) => {
  const year = Number(query.year || new Date().getFullYear());
  const result = await User.aggregate([
    {
      $match: {
        isDeleted: false,
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        monthNum: '$_id.month',
        count: 1,
        _id: 0,
      },
    },
  ]).then(data => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((m, i) => {
      const found = data.find(d => d.monthNum === i + 1);
      return { month: m, count: found ? found.count : 0 };
    });
  });

  return result;
};

export const AnalyticsServices = {
  getOverview,
  getMonthlyUserGrowth,
};
