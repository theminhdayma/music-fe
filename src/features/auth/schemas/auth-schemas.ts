import { OTP_LENGTH } from "@/constants/auth"
import { z } from "zod"

const emailSchema = z.string().trim().email("Please enter a valid email")

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(255, "Full name must be at most 255 characters"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["BUYER", "SELLER"]),
})

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
    .regex(/^\d+$/, "OTP must contain only digits"),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: z
      .string()
      .trim()
      .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
      .regex(/^\d+$/, "OTP must contain only digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(255, "Full name must be at most 255 characters"),
  avatarUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phoneNumber: z.string().trim().max(32, "Phone number must be at most 32 characters").optional().or(z.literal("")),
  address: z.string().trim().max(255, "Address must be at most 255 characters").optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date")
    .optional()
    .or(z.literal("")),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
