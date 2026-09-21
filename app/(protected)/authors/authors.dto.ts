import z from "zod"
import { AuthorStatus } from "./authors.type"

export const authorSchema = (_isEdit?: boolean) => {
  void _isEdit
  return z.object({
    name: z.string().min(2).max(100),
    bio: z.string().optional(),
    avatar: z.string().optional().nullable(),
    designation: z.string().optional(),
    social_links: z
      .object({
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
        facebook: z.string().optional(),
      })
      .optional(),
    status: z.nativeEnum(AuthorStatus).default(AuthorStatus.ACTIVE),
  })
}

export type AuthorFormValues = z.input<ReturnType<typeof authorSchema>>
