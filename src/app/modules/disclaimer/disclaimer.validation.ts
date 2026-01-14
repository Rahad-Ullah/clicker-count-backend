import { z } from 'zod';
import { DisclaimerType } from './disclaimer.constants';

// Disclaimer creation schema
export const createDisclaimerValidation = z.object({
  body: z
    .object({
      type: z.nativeEnum(DisclaimerType),
      content: z.string().nonempty('Content is required'),
    })
    .strict(),
});

export const DisclaimerValidations = {
  createDisclaimerValidation,
};
