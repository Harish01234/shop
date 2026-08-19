import { prisma } from '#/db'
import type { JinisWhereInput } from '#/generated/prisma/models/Jinis'

import { sumJinisWeights } from './jinis.utils'
import type {
  CreateJinisInput,
  JinisIdInput,
  ListJinisInput,
  SettleJinisInput,
  UpdateJinisInput,
} from './jinis.types'

function dayStart(value: string) {
  return new Date(`${value}T00:00:00`)
}

function dayEnd(value: string) {
  return new Date(`${value}T23:59:59.999`)
}

export async function listJinisRecords(data: ListJinisInput) {
  const filters: JinisWhereInput[] = []

  if (data.active !== undefined) {
    filters.push({ active: data.active })
  }

  if (data.slNo) {
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Jinis"
      WHERE CAST("slNo" AS TEXT) ILIKE ${`%${data.slNo}%`}
    `
    filters.push(
      matches.length > 0
        ? { id: { in: matches.map((row) => row.id) } }
        : { id: '__none__' },
    )
  }

  if (data.name) {
    filters.push({
      name: { contains: data.name, mode: 'insensitive' },
    })
  }

  if (data.fatherName) {
    filters.push({
      fatherName: { contains: data.fatherName, mode: 'insensitive' },
    })
  }

  if (data.phoneNo) {
    filters.push({
      phoneNo: { contains: data.phoneNo, mode: 'insensitive' },
    })
  }

  if (data.type) {
    filters.push({ type: data.type })
  }

  if (data.creditMin !== undefined || data.creditMax !== undefined) {
    filters.push({
      credit: {
        ...(data.creditMin !== undefined ? { gte: data.creditMin } : {}),
        ...(data.creditMax !== undefined ? { lte: data.creditMax } : {}),
      },
    })
  }

  if (data.date) {
    filters.push({
      date: {
        gte: dayStart(data.date),
        lte: dayEnd(data.date),
      },
    })
  }

  if (data.from || data.to) {
    filters.push({
      date: {
        ...(data.from ? { gte: dayStart(data.from) } : {}),
        ...(data.to ? { lte: dayEnd(data.to) } : {}),
      },
    })
  }

  return prisma.jinis.findMany({
    where: filters.length ? { AND: filters } : undefined,
    include: { items: true },
    orderBy: { date: 'desc' },
  })
}

export async function getJinisRecord(data: JinisIdInput) {
  return prisma.jinis.findUnique({
    where: { id: data.id },
    include: { items: true },
  })
}

export async function createJinisRecord(
  data: CreateJinisInput,
  createdById: string,
) {
  const weights = sumJinisWeights(data.items)

  return prisma.jinis.create({
    data: {
      slNo: data.slNo,
      name: data.name,
      fatherName: data.fatherName,
      phoneNo: data.phoneNo,
      credit: data.credit,
      type: data.type,
      date: data.date,
      active: data.active,
      goldWeight: weights.goldWeight,
      silverWeight: weights.silverWeight,
      createdById,
      items: {
        create: data.items,
      },
    },
    include: { items: true },
  })
}

export async function updateJinisRecord(data: UpdateJinisInput) {
  const existing = await prisma.jinis.findUnique({
    where: { id: data.id },
  })

  if (!existing) {
    return null
  }

  const { id, items, ...fields } = data
  const weights = items ? sumJinisWeights(items) : null

  return prisma.jinis.update({
    where: { id },
    data: {
      ...fields,
      ...(weights && items
        ? {
            goldWeight: weights.goldWeight,
            silverWeight: weights.silverWeight,
            items: {
              deleteMany: {},
              create: items,
            },
          }
        : {}),
    },
    include: { items: true },
  })
}

export async function deleteJinisRecord(data: JinisIdInput) {
  const existing = await prisma.jinis.findUnique({
    where: { id: data.id },
  })

  if (!existing) {
    return null
  }

  await prisma.jinis.delete({
    where: { id: data.id },
  })

  return { id: data.id }
}

export async function settleJinisRecord(data: SettleJinisInput) {
  const existing = await prisma.jinis.findUnique({
    where: { id: data.id },
  })

  if (!existing) {
    return null
  }

  return prisma.jinis.update({
    where: { id: data.id },
    data: {
      active: false,
      settledAt: data.settledAt ?? new Date(),
    },
    include: { items: true },
  })
}
