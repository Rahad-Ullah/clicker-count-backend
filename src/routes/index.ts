import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { supportRoutes } from '../app/modules/support/support.route';
import { contactRoutes } from '../app/modules/contact/contact.route';
import { disclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { analyticsRoutes } from '../app/modules/analytics/analytics.route';
import { postRoutes } from '../app/modules/post/post.route';
import { friendshipRoutes } from '../app/modules/friendship/friendship.route';
import { friendRequestRoutes } from '../app/modules/friendRequest/friendRequest.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { notificationRoutes } from '../app/modules/notification/notification.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { joinRequestRoutes } from '../app/modules/joinRequest/joinRequest.route';
import { advertiserRoutes } from '../app/modules/advertiser/advertiser.route';
import { advertisementRoutes } from '../app/modules/advertisement/advertisement.route';
import { planRoutes } from '../app/modules/plan/plan.route';
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
    path: '/posts',
    route: postRoutes,
  },
  {
    path: '/friend-requests',
    route: friendRequestRoutes,
  },
  {
    path: '/friendships',
    route: friendshipRoutes,
  },
  {
    path: '/chats',
    route: ChatRoutes,
  },
  {
    path: '/join-requests',
    route: joinRequestRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/advertisers',
    route: advertiserRoutes,
  },
  {
    path: '/advertisements',
    route: advertisementRoutes,
  },
  {
    path: '/plans',
    route: planRoutes,
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
