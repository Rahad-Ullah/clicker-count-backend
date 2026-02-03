import { z } from 'zod';

const createAdvertisementValidation = z.object({
  body: z
    .object({
      title: z.string().nonempty('Title cannot be empty'),
      description: z.string().nonempty('Description cannot be empty'),
      image: z.any(),
      focusArea: z.string().nonempty('Focus area cannot be empty'),
      focusAreaLocation: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]'),
      websiteUrl: z.string().url('Website URL must be valid'),
      startAt: z.coerce.date(),
      endAt: z.coerce.date(),
      price: z.number().positive('Price must be greater than 0'),
    })
    .strict(),
});

// update advertisement
const updateAdvertisementValidation = z.object({
  body: z
    .object({
      title: z.string().nonempty('Title cannot be empty').optional(),
      description: z
        .string()
        .nonempty('Description cannot be empty')
        .optional(),
      image: z.any().optional(),
      focusArea: z.string().nonempty('Focus area cannot be empty').optional(),
      focusAreaLocation: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]')
        .optional(),
      websiteUrl: z.string().url('Website URL must be valid').optional(),
    })
    .strict(),
});

export const AdvertisementValidations = {
  createAdvertisementValidation,
  updateAdvertisementValidation,
};
