import z from "zod"
import { BrandStatus } from "./brands.type"

export const brandSchema = () => {
  return z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z.string().optional(),
    description: z.string().optional(),
    about: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    official_site_links: z.string().optional(),
    logo: z.string().optional(),
    thumbnail: z.string().optional(),
    status: z.nativeEnum(BrandStatus).default(BrandStatus.ACTIVE),
    is_featured: z.boolean().default(false),
    order: z.number().optional().default(0),
  })
}

export type BrandFormValues = z.input<ReturnType<typeof brandSchema>>
