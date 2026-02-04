import { z } from 'zod';

// Zod validation schemas
const settingValidation = z.object({
  body: z
    .object({
      nearbyRange: z.number().min(0, 'Nearby range must be at least 0'),
    })
    .strict(),
});

export const SettingValidations = {
  settingValidation,
};
