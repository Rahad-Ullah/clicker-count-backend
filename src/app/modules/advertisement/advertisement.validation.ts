import { z } from 'zod';
import { objectId } from '../../../helpers/zodHelper';
import { APPROVAL_STATUS } from './advertisement.constants';

const createAdvertisementValidation = z.object({
  body: z
    .object({
      title: z.string().nonempty('Title cannot be empty'),
      description: z.string().nonempty('Description cannot be empty'),
      image: z.any().optional(),
      focusArea: z.string().nonempty('Focus area cannot be empty'),
      longitude: z
        .string()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
      latitude: z
        .string()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
      websiteUrl: z.string().url('Website URL must be valid'),
      startAt: z.string().datetime(),
      plan: objectId('Invalid plan ID'),
    })
    .strict(),
});

// update advertisement
const updateAdvertisementValidation = z.object({
  params: z.object({
    id: objectId('Invalid advertisement ID'),
  }),
  body: z
    .object({
      title: z.string().nonempty('Title cannot be empty').optional(),
      description: z
        .string()
        .nonempty('Description cannot be empty')
        .optional(),
      image: z.any().optional(),
      focusArea: z.string().nonempty('Focus area cannot be empty').optional(),
      longitude: z
        .string()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .optional(),
      latitude: z
        .string()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .optional(),
      websiteUrl: z.string().url('Website URL must be valid').optional(),
    })
    .strict(),
});

// update advertisement status
const updateAdvertisementStatusValidation = z.object({
  params: z
    .object({
      id: objectId('Invalid advertisement ID'),
    })
    .strict(),
  body: z
    .object({
      approvalStatus: z.enum([
        APPROVAL_STATUS.Approved,
        APPROVAL_STATUS.Rejected,
      ]),
    })
    .strict(),
});

// delete advertisement
const deleteAdvertisementValidation = z.object({
  params: z
    .object({
      id: objectId('Invalid advertisement ID'),
    })
    .strict(),
});

// get active advertisements
const getNearbyActiveAds = z.object({
  query: z
    .object({
      deviceId: z.string().nonempty('Device ID is required'),
      lng: z
        .string()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
      lat: z
        .string()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
    })
    .strict(),
});

// track ad click
const trackAdClick = z.object({
  params: z
    .object({
      id: objectId('Invalid advertisement ID'),
    })
    .strict(),
});

export const AdvertisementValidations = {
  createAdvertisementValidation,
  updateAdvertisementValidation,
  updateAdvertisementStatusValidation,
  deleteAdvertisementValidation,
  getNearbyActiveAds,
  trackAdClick,
};
