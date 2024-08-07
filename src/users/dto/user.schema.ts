import { z } from 'zod';

export const UserResourceSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string().email('This is not a valid email.'),
    is_active: z.boolean(),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .required();

  export const BorrowBooksBodySchema = z
    .object({
      borrowings: z
        .array(
          z.object({
            book_id: z.number(),
            due_date: z.coerce.date(),
          }),
        )
        .min(1),
    })
    .required();

  export const CreateUserSchema = UserResourceSchema.omit({
    is_active: true,
    id: true,
    created_at: true,
    updated_at: true,
  });

  export const UpdateUserSchema = CreateUserSchema.partial();

  export type CreateUserType = z.infer<typeof CreateUserSchema>;
  export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
  export type UserResourceType = z.infer<typeof UserResourceSchema>;
  export type BorrowBooksBodyType = z.infer<typeof BorrowBooksBodySchema>;

