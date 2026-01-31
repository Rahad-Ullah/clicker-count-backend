import { z } from 'zod';
import { FRIEND_REQUEST_STATUS } from './friendRequest.constants';
import { objectId } from '../../../helpers/zodHelper';

// create friend request schema
export const createFriendRequestValidation = z.object({
  body: z
    .object({
      receiver: z
        .string({ required_error: 'Receiver ID is required' })
        .length(24, 'Invalid receiver ID'),
    })
    .strict(),
});

// update friend request schema
export const updateFriendRequestValidation = z.object({
  params: z.object({
    id: objectId('Invalid friend request ID'),
  }),
  body: z
    .object({
      status: z.nativeEnum(FRIEND_REQUEST_STATUS),
    })
    .strict(),
});

export const FriendRequestValidations = {
  createFriendRequestValidation,
  updateFriendRequestValidation,
};
