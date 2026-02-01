import { z } from 'zod';

// create advertiser validation
const createAdvertiserValidation = z.object({
  body: z
    .object({
      businessName: z.string().nonempty('Name cannot be empty'),
      businessType: z.string().nonempty('Business type cannot be empty'),
      licenseNumber: z.string().nonempty('License number cannot be empty'),
      phone: z
        .string()
        .min(10, 'Phone must be at least 10 characters')
        .max(15, 'Phone must be at most 17 characters'),
      bio: z.string().nonempty('Bio cannot be empty'),
      image: z.any(),
    })
    .strict(),
});

// update advertiser validation
const updateAdvertiserValidation = z.object({
  body: z
    .object({
      businessName: z.string().nonempty('Name cannot be empty').optional(),
      businessType: z
        .string()
        .nonempty('Business type cannot be empty')
        .optional(),
      licenseNumber: z
        .string()
        .nonempty('License number cannot be empty')
        .optional(),
      phone: z
        .string()
        .min(10, 'Phone must be at least 10 characters')
        .max(15, 'Phone must be at most 17 characters')
        .optional(),
      bio: z.string().nonempty('Bio cannot be empty').optional(),
      image: z.any().optional(),
    })
    .strict(),
});

export const AdvertiserValidations = {
  createAdvertiserValidation,
  updateAdvertiserValidation,
};
