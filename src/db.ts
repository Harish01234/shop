import { PrismaClient } from './generated/prisma/client.js'

import { getDatabaseUrl } from './database-url.js'

import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  })
  return new PrismaClient({ adapter })
}

const cached = globalThis.__prisma
export const prisma =
  cached && typeof cached.jinis !== 'undefined' ? cached : createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
