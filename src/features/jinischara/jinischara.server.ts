import { prisma } from '#/db'
import type { JinisCharaWhereInput } from '#/generated/prisma/models/JinisChara'

import type {
  CreateJinisCharaInput,
  JinisCharaIdInput,
  ListJinisCharaInput,
  SettleJinisCharaInput,
  UpdateJinisCharaInput,
} from './jinischara.types'

function dayStart(value: string) {
  return new Date(`${value}T00:00:00`)
}

function dayEnd(value: string) {
  return new Date(`${value}T23:59:59.999`)
}

export async function listJinisCharaRecords(data: ListJinisCharaInput) {
  const filters: JinisCharaWhereInput[] = []

  if (data.active !== undefined) {
    filters.push({ active: data.active })
  }

  if (data.slNo) {
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "JinisChara"
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

  if (data.creditMin !== undefined || data.creditMax !== undefined) {
    filters.push({
      credit: {
        ...(data.creditMin !== undefined ? { gte: data.creditMin } : {}),
        ...(data.creditMax !== undefined ? { lte: data.creditMax } : {}),
      },
    })
  }

  if (data.percentageMin !== undefined || data.percentageMax !== undefined) {
    filters.push({
      percentage: {
        ...(data.percentageMin !== undefined ? { gte: data.percentageMin } : {}),
        ...(data.percentageMax !== undefined ? { lte: data.percentageMax } : {}),
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

  return prisma.jinisChara.findMany({
    where: filters.length ? { AND: filters } : undefined,
    orderBy: { date: 'desc' },
  })
}

export async function getJinisCharaRecord(data: JinisCharaIdInput) {
  return prisma.jinisChara.findUnique({
    where: { id: data.id },
  })
}

export async function createJinisCharaRecord(
  data: CreateJinisCharaInput,
  createdById: string,
) {
  return prisma.jinisChara.create({
    data: {
      slNo: data.slNo,
      name: data.name,
      fatherName: data.fatherName,
      phoneNo: data.phoneNo,
      credit: data.credit,
      percentage: data.percentage,
      description: data.description || null,
      date: data.date,
      active: data.active,
      createdById,
    },
  })
}

export async function updateJinisCharaRecord(data: UpdateJinisCharaInput) {
  const existing = await prisma.jinisChara.findUnique({
    where: { id: data.id },
  })

  if (!existing) {
    return null
  }

  const { id, ...fields } = data

  return prisma.jinisChara.update({
    where: { id },
    data: {
      ...fields,
      ...(fields.description !== undefined
        ? { description: fields.description || null }
        : {}),
    },
  })
}

export async function deleteJinisCharaRecord(data: JinisCharaIdInput) {
  const existing = await prisma.jinisChara.findUnique({
    where: { id: data.id },
  })

  if (!existing) {
    return null
  }

  await prisma.jinisChara.delete({
    where: { id: data.id },
  })

  return { id: data.id }
}

export async function settleJinisCharaRecord(data: SettleJinisCharaInput) {
  const existing = await prisma.jinisChara.findUnique({
    where: { id: data.id },
  })

  if (!existing) {
    return null
  }

  return prisma.jinisChara.update({
    where: { id: data.id },
    data: {
      active: false,
      settledAt: data.settledAt ?? new Date(),
    },
  })
}

export async function sumActiveJinisCharaCredit() {
  const result = await prisma.jinisChara.aggregate({
    where: { active: true },
    _sum: { credit: true },
  })

  return result._sum.credit ?? 0
}
