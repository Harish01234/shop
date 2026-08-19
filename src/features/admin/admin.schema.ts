import { z } from 'zod'

export const adminSessionIdSchema = z.object({
  id: z.string().min(1),
})

export const adminExportTypeSchema = z.enum(['users', 'jinis', 'sessions'])

export const adminExportFormatSchema = z.enum(['csv', 'json'])

export const adminExportSchema = z.object({
  type: adminExportTypeSchema,
  format: adminExportFormatSchema,
  from: z.coerce.date(),
  to: z.coerce.date(),
})

export const adminJinisImportRowSchema = z.object({
  slNo: z.number().int().positive(),
  name: z.string().trim().min(1),
  fatherName: z.string().trim().min(1),
  date: z.coerce.date(),
  credit: z.number().int().positive(),
  phoneNo: z.string().trim().min(1).default('-'),
})

export const adminJinisImportSchema = z.object({
  rows: z.array(adminJinisImportRowSchema).min(1).max(5000),
})
