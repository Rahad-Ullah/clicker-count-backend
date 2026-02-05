import { z } from 'zod';
import { GENDER, USER_PRIVACY } from './user.constant';

const createUserZodSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .nonempty("Name can't be empty!"),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email!'),
      password: z.string({ required_error: 'Password is required' }).min(8, {
        message: 'Password must be at least 8 characters long',
      }),
    })
    .strict(),
});

const updateUserZodSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .nonempty("Name can't be empty!")
        .optional(),
      bio: z.string().optional(),
      dob: z.string().datetime().optional(),
      gender: z.nativeEnum(GENDER).optional(),
      privacy: z.nativeEnum(USER_PRIVACY).optional(),
      address: z.string().nonempty('Address cannot be empty').optional(),
      location: z
        .array(z.number())
        .length(
          2,
          'Location must be an array of 2 numbers [longitude, latitude]',
        )
        .optional(),
      isLocationVisible: z.boolean().optional(),
      image: z.string().optional(),
    })
    .strict(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
