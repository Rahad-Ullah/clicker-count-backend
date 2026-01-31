import z from 'zod';
import { objectId } from '../../../helpers/zodHelper';

const checkFriendship = z.object({
  params: z.object({
    id: objectId('Invalid friend ID'),
  }),
});

export const FriendshipValidations = { checkFriendship };
