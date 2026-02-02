import { z } from 'zod'

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Simple password schema (for login - less strict)
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')

// Full name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')

// OTP validation
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers')

// Signup form schema
export const signupSchema = z
  .object({
    full_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password form schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

// Update profile form schema
export const updateProfileSchema = z.object({
  full_name: nameSchema,
})

// Alias for backwards compatibility
export const profileSchema = updateProfileSchema

// Text verification schema
export const textVerificationSchema = z.object({
  text: z
    .string()
    .min(50, 'Text must be at least 50 characters for accurate verification')
    .max(150000, 'Text must be less than 150,000 characters'),
})
