import { z } from 'zod'

export const commerceItemSchema = z.object({
  itemId: z.number(),
  name: z.string(),
  quantity: z.number(),
})

export const commerceGoodSchema = z.object({
  name: z.string(),
  description: z.string(),
  weight: z.number(),
  minValue: z.number(),
  maxValue: z.number(),
  weeklyLimit: z.number(),
  maxQtyPerSlot: z.number(),
  items: z.array(commerceItemSchema),
})

export type CommerceItem = z.infer<typeof commerceGoodSchema>

export const commerceLocationSchema = z.object({
  location: z.string(),
  goods: z.array(commerceGoodSchema),
})

export type CommerceLocation = z.infer<typeof commerceLocationSchema>
