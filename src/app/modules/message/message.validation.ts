import { z } from 'zod';
import { MESSAGE_TYPE } from './message.constant';
import { objectId } from '../../../helpers/zodHelper';

// Define the validation schema for Message
const createMessageSchema = z.object({
  body: z
    .object({
      chat: objectId,
      type: z.nativeEnum(MESSAGE_TYPE),
      text: z.string().nonempty('Message content is required').optional(),
      image: z.any().optional(),
      media: z.any().optional(),
      doc: z.any().optional(),
    })
    .strict(),
});

export const MessageValidations = { createMessageSchema };
