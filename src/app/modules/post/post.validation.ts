import { z } from 'zod';
import { POST_PRIVACY } from './post.constants';
import { objectId } from '../../../helpers/zodHelper';
import { USER_STATUS } from '../user/user.constant';

// create post schema
export const createPostValidation = z.object({
  body: z
    .object({
      description: z
        .string()
        .nonempty('Description cannot be empty')
        .optional(),
      clickerType: z.string().nonempty('Clicker type cannot be empty'),
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
      clickerType: z
        .string()
        .nonempty('Clicker type cannot be empty')
        .optional(),
      privacy: z.nativeEnum(POST_PRIVACY).optional(),
      status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE]).optional(),
      image: z.any().optional(),
      removedImages: z
        .string()
        .transform(val => {
          const parsed = JSON.parse(val);
          if (
            Array.isArray(parsed) &&
            parsed.every(i => typeof i === 'string')
          ) {
            return parsed as string[];
          }
          throw new Error('Invalid existingImages format');
        })
        .optional(),
    })
    .strict(),
});

const deletePostValidation = z.object({
  params: z.object({
    id: objectId('Invalid post ID'),
  }),
});

export const PostValidations = {
  createPostValidation,
  updatePostValidation,
  deletePostValidation,
};
