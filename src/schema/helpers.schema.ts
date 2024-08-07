import { z } from 'zod';

export const PaginatedRequestSchema = z
  .object({
    page: z.number(),
    per_page: z.number(),
  })
  .required();

export type PaginatedRequestType = z.infer<typeof PaginatedRequestSchema>;

export type Meta = {
  total: number;
  current_page: number | null;
  per_page: number | null;
};
