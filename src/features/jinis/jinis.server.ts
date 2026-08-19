import { prisma } from '#/db'

import { sumJinisWeights } from './jinis.utils'
import type {
  CreateJinisInput,
  JinisIdInput,
  ListJinisInput,
  SettleJinisInput,
  UpdateJinisInput,
} from './jinis.types'

export async function listJinisRecords(data: ListJinisInput) {
  return prisma.jinis.findMany({
    where: data.active === undefined ? undefined : { active: data.active },
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
