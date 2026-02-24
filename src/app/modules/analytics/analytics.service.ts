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
        role: { $in: [USER_ROLES.USER, USER_ROLES.ADVERTISER] }, // Optional: Filter for only these two roles
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        // Group by both month AND role
        _id: {
          month: { $month: '$createdAt' },
          role: '$role',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        monthNum: '$_id.month',
        role: '$_id.role',
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
      const monthIndex = i + 1;

      const userCount =
        data.find(d => d.monthNum === monthIndex && d.role === USER_ROLES.USER)
          ?.count || 0;
      const advertiserCount =
        data.find(
          d => d.monthNum === monthIndex && d.role === USER_ROLES.ADVERTISER,
        )?.count || 0;

      return {
        month: m,
        user: userCount,
        advertiser: advertiserCount,
      };
    });
  });

  return result;
};

export const AnalyticsServices = {
  getOverview,
  getMonthlyUserGrowth,
};
