import z from 'zod';

export const objectId = (message: string = 'Invalid ID') =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, message);
