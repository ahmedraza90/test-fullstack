import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(5, 'Password must be at least 6 characters')
});

export const PasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old Password is required'),
    newPassword: z.string().min(1, 'New Password is required'),
    confirmPassword: z.string().min(1, 'Confirm Password is required')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'New Password and Confirm Password do not match'
  });

export const SetupPasswordSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'New Password is required'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
    token: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'New Password and Confirm Password do not match'
  });

export const AdminRegisterSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });
