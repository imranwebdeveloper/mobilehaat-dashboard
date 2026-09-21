import z from "zod"

export const userSchema = (isEdit = false) => {
  const schema = z.object({
    first_name: z.string().min(2).max(24),
    last_name: z.string().min(2).max(24),
    email: z.email(),
    password: isEdit
      ? z.string().min(6).optional().or(z.literal(""))
      : z.string().min(6),
    phone_number: z.string().or(z.literal("")),
    address: z.string().optional(),
    country: z.string().optional(),
    gender: z.string().optional(),
    is_active: z.boolean(),
    is_verified: z.boolean(),
    avatar: z.string().optional(),
    roles: z.array(z.string()),
  })

  return schema
}

export type UserFormValues = z.input<ReturnType<typeof userSchema>>
