
import {string, z} from 'zod'



export const userSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(3, "Password must be atleast 3 characters long"),
    phone: z.string().regex(
        /^(?!0{10})\d{10}$/,
  "Enter a valid 10-digit phone number"
    ),

    role: z.enum(['ADMIN','STATE_HEAD', 'DISTRICT_HEAD', 'BLOCK_MANAGER', 'STORE_MANAGER', 'SITE_ENGINEER']),
    districtId: string().optional(),
    blockId: string().optional(),
    siteId: string().optional(),
    stateId: string().optional()
})