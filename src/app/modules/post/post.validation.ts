import { z } from 'zod';
import { POST_PRIVACY } from './post.constants';

// create post schema
export const createPostValidation = z.object({
  body: z
    .object({
      description: z.string().nonempty('Description is required'),
      clickerType: z.string().nonempty('Clicker type is required'),
      privacy: z.nativeEnum(POST_PRIVACY),
      image: z.any(),
    })
    .strict(),
});

// update post schema
export const updatePostValidation = z.object({
  body: z
    .object({
      description: z
        .string()
        .nonempty('Description cannot be empty')
        .optional(),
      clickerType: z.string().nonempty('Clicker type is required').optional(),
      privacy: z.nativeEnum(POST_PRIVACY).optional(),
      image: z.any().optional(),
    })
    .strict(),
});

export const PostValidations = {
  createPostValidation,
  updatePostValidation,
};
