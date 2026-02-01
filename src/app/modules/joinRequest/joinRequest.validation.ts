import { z } from 'zod';
import { JOIN_REQUEST_STATUS } from './joinRequest.constants';
import { objectId } from '../../../helpers/zodHelper';

const createJoinRequest = z.object({
  body: z
    .object({
      chat: z.string().nonempty('Chat ID is required'),
    })
    .strict(),
});

const updateJoinRequest = z.object({
  params: z.object({
    id: objectId('Invalid join request ID'),
  }),
  body: z
    .object({
      status: z.nativeEnum(JOIN_REQUEST_STATUS),
    })
    .strict(),
});

// get pending request
const getPendingRequest = z.object({
  params: z
    .object({
      id: objectId('Invalid chat ID'),
    })
    .strict(),
  query: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional(),
    })
    .strict(),
});

export const JoinRequestValidations = {
  createJoinRequest,
  updateJoinRequest,
  getPendingRequest,
};
