import z from "zod"
import { ContactStatus } from "./contacts.type"

export const contactSchema = (_isEdit?: boolean) => {
  return z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    subject: z.string().min(2).max(200),
    message: z.string().min(10).max(2000),
    status: z.nativeEnum(ContactStatus).default(ContactStatus.NEW),
    is_read: z.boolean().default(false),
    admin_notes: z.string().optional(),
  })
}

export type ContactFormValues = z.input<ReturnType<typeof contactSchema>>
