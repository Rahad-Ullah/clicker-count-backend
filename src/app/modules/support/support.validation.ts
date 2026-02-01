import { z } from 'zod';
import { SupportStatus } from './support.constants';
import { objectId } from '../../../helpers/zodHelper';

export const createSupportSchema = z.object({
  body: z
    .object({
      title: z.string().nonempty('Title cannot be empty'),
      message: z.string().nonempty('Message cannot be empty'),
      image: z.any().optional(),
    })
    .strict(),
});

export const updateSupportSchema = z.object({
  params: z.object({
    id: objectId('Invalid support ID'),
  }),
  body: z
    .object({
      status: z.nativeEnum(SupportStatus),
    })
    .strict(),
});

export const SupportValidations = {
  createSupportSchema,
  updateSupportSchema,
};
