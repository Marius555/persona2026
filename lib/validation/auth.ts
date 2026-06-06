import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = loginSchema
  .extend({
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

/** Field-level validation errors keyed by field name. */
export type FieldErrors = Record<string, string>;

/**
 * Reduces a ZodError to one message per field, in the `Record<string, string>`
 * shape that HeroUI's `Form` `validationErrors` prop expects.
 */
export function flattenFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !result[key]) {
      result[key] = issue.message;
    }
  }

  return result;
}
