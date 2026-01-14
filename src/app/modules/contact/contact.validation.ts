import { z } from 'zod';

// Contact creation schema
export const contactValidation = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email format').optional(),
      phone: z
        .string()
        .min(10, 'Phone must be at least 10 characters')
        .max(15, 'Phone must be at most 15 characters')
        .optional(),
      whatsApp: z
        .string()
        .min(10, 'WhatsApp must be at least 10 characters')
        .max(15, 'WhatsApp must be at most 15 characters')
        .optional(),
    })
    .strict(),
});

export const ContactValidations = {
  contactValidation,
};
