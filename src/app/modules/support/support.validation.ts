import { z } from 'zod';
import { SupportStatus } from './support.constants';

export const createSupportSchema = z.object({
  body: z
    .object({
      title: z.string().nonempty('Title cannot be empty'),
      message: z.string().nonempty('Message cannot be empty'),
    })
    .strict(),
});

export const updateSupportSchema = z.object({
  body: z
    .object({
      status: z.nativeEnum(SupportStatus).optional(),
    })
    .strict(),
});

export const SupportValidations = {
  createSupportSchema,
  updateSupportSchema,
};
