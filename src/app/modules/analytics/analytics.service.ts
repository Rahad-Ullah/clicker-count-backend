import { USER_STATUS } from '../user/user.constant';
import { User } from '../user/user.model';

// ------------- get overview -------------
const getOverview = async () => {
  const [totalUsers, activeUsers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: USER_STATUS.ACTIVE }),
  ]);

  return {
    totalUsers,
    activeUsers,
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
      _id: { month: { $month: "$createdAt" } },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      monthNum: "$_id.month",
      count: 1,
      _id: 0,
    },
  },
])
  .then((data) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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
