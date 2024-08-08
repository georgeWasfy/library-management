import { PaginatedRequestSchema } from '@base/schema/helpers.schema';
import { z } from 'zod';

export const BookResourceSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    author: z.string(),
    isbn: z.number(),
    total_quantity: z.number(),
    available_quantity: z.number(),
    shelf_location: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .required();

export const CreateBookSchema = BookResourceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  available_quantity: true,
});

export const UpdateBookSchema = CreateBookSchema.merge(
  z.object({ available_quantity: z.number() }),
).partial();

export const BookFiltersSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  isbn: z.number().optional(),
  is_overdue: z.boolean().optional()
});

export const BookQuerySchema = z.object({
  filters: BookFiltersSchema.optional(),
  paging: PaginatedRequestSchema.optional(),
});

export type CreateBookType = z.infer<typeof CreateBookSchema>;
export type UpdateBookType = z.infer<typeof UpdateBookSchema>;
export type BookResourceType = z.infer<typeof BookResourceSchema>;
export type BookQueryType = z.infer<typeof BookQuerySchema>;
export type BookFilterType = z.infer<typeof BookFiltersSchema>;
export type BookWhereClause = {
  where: { [K in keyof BookFilterType]: BookFilterType[K] };
};
