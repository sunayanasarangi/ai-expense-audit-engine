import * as z from 'zod';

export const registerSchema = z.object({
  username: z
    .string({
      error: (issue) =>
        issue.input == undefined
          ? 'Username is required'
          : `Username must be text, received ${typeof issue.input}`,
    })
    .trim()
    .min(2)
    .max(30),
  email: z
    .email({
      error: (issue) =>
        issue.input == undefined ? 'Email is required' : 'Invalid email format',
    })
    .trim()
    .toLowerCase(),
  password: z.string({ error: 'Password is required' }).min(8, {
    error: 'Password must be at least 8 characters long',
  }),
});

export const loginSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input == undefined ? 'Email is required' : 'Invalid email format',
    })
    .trim()
    .toLowerCase(),
  password: z.string({ error: 'Password is required' }).min(8, {
    error: 'Password must be at least 8 characters long',
  }),
});
