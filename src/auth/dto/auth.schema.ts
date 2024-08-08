import { z } from 'zod';

export const SignInSchema = z
  .object({
    email: z.string().email('This is not a valid email.'),
    password: z.string().min(6),
  })
  .required();

export const SignUpSchema = z
  .object({
    name: z.string(),
    email: z.string().email('This is not a valid email.'),
    password: z.string().min(6),
  })
  .required();
export type SignInType = z.infer<typeof SignInSchema>;
export type SignUpType = z.infer<typeof SignUpSchema>;

export type Tokens = {
  access_token: string;
  refresh_token: string;
};
