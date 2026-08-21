import { notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import {
  closeDailyCalculationSchema,
  createDailyCalculationSchema,
  dailyCalculationIdSchema,
  listDailyCalculationSchema,
  updateDailyCalculationSchema,
} from './dailycalculation.schema'
import {
  closeDailyCalculationRecord,
  createDailyCalculationRecord,
  deleteDailyCalculationRecord,
  getDailyCalculationRecord,
  getDailyCalculationDetailRecord,
  listDailyCalculationRecords,
  previewDailyCalculationTotals,
  refreshDailyCalculationTotalsRecord,
  updateDailyCalculationRecord,
} from './dailycalculation.server'

async function requireUser() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/signin' })
  }

  return session.user
}

export const listDailyCalculation = createServerFn({ method: 'GET' })
  .validator(listDailyCalculationSchema)
  .handler(async ({ data }) => {
    await requireUser()
    return listDailyCalculationRecords(data)
  })

export const getDailyCalculation = createServerFn({ method: 'GET' })
  .validator(dailyCalculationIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const record = await getDailyCalculationRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const getDailyCalculationDetail = createServerFn({ method: 'GET' })
  .validator(dailyCalculationIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const detail = await getDailyCalculationDetailRecord(data)

    if (!detail) {
      throw notFound()
    }

    return detail
  })

export const refreshDailyCalculation = createServerFn({ method: 'POST' })
  .validator(dailyCalculationIdSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()

    const record = await refreshDailyCalculationTotalsRecord(data, user.id)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const previewDailyCalculation = createServerFn({ method: 'POST' })
  .validator(createDailyCalculationSchema)
  .handler(async ({ data }) => {
    await requireUser()
    return previewDailyCalculationTotals(data)
  })

export const createDailyCalculation = createServerFn({ method: 'POST' })
  .validator(createDailyCalculationSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()
    return createDailyCalculationRecord(data, user.id)
  })

export const updateDailyCalculation = createServerFn({ method: 'POST' })
  .validator(updateDailyCalculationSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()

    const record = await updateDailyCalculationRecord(data, user.id)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const closeDailyCalculation = createServerFn({ method: 'POST' })
  .validator(closeDailyCalculationSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()

    const record = await closeDailyCalculationRecord(data, user.id)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const deleteDailyCalculation = createServerFn({ method: 'POST' })
  .validator(dailyCalculationIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const result = await deleteDailyCalculationRecord(data)

    if (!result) {
      throw notFound()
    }

    return result
  })
