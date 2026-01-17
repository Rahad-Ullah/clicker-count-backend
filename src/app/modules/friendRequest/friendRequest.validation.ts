import { z } from 'zod';

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

export const FriendRequestValidations = {
  createFriendRequestValidation,
};
