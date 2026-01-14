import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { supportRoutes } from '../app/modules/support/support.route';
import { contactRoutes } from '../app/modules/contact/contact.route';
import { disclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { analyticsRoutes } from '../app/modules/analytics/analytics.route';
const router = express.Router();

const apiRoutes: { path: string; route: any }[] = [
  {
    path: '/analytics',
    route: analyticsRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/supports',
    route: supportRoutes,
  },
  {
    path: '/contact',
    route: contactRoutes,
  },
  {
    path: '/disclaimer',
    route: disclaimerRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
