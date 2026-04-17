import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z
      .union([z.email(), z.literal("")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    phone: z
      .union([z.string().trim().min(10).max(32), z.literal("")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((d) => d.email !== undefined || d.phone !== undefined, {
    message: "Provide either email or phone",
    path: ["email"],
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });