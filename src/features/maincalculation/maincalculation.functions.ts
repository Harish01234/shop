import { notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import { isAdminRole } from '#/lib/admin-role'
import {
  createMainCalculationSchema,
  listAvailableDailyCalculationsSchema,
  listMainCalculationSchema,
  mainCalculationIdSchema,
  previewMainCalculationSchema,
  updateMainCalculationSchema,
} from './maincalculation.schema'
import {
  createMainCalculationRecord,
  deleteMainCalculationRecord,
  finalizeMainCalculationRecord,
  getMainCalculationRecord,
  listAvailableDailyCalculations,
  listMainCalculationRecords,
  previewMainCalculationTotals,
  updateMainCalculationRecord,
} from './maincalculation.server'

async function requireAdmin() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/signin' })
  }

  if (!isAdminRole(session.user.role)) {
    throw redirect({ to: '/' })
  }

  return session
}

export const listMainCalculation = createServerFn({ method: 'GET' })
  .validator(listMainCalculationSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return listMainCalculationRecords(data)
  })

export const getMainCalculation = createServerFn({ method: 'GET' })
  .validator(mainCalculationIdSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const record = await getMainCalculationRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const listAvailableDailyCalculationsForMainCalc = createServerFn({
  method: 'POST',
})
  .validator(listAvailableDailyCalculationsSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return listAvailableDailyCalculations(data)
  })

export const previewMainCalculation = createServerFn({ method: 'POST' })
  .validator(previewMainCalculationSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return previewMainCalculationTotals(data)
  })

export const createMainCalculation = createServerFn({ method: 'POST' })
  .validator(createMainCalculationSchema)
  .handler(async ({ data }) => {
    const session = await requireAdmin()
    return createMainCalculationRecord(data, session.user.id)
  })

export const updateMainCalculation = createServerFn({ method: 'POST' })
  .validator(updateMainCalculationSchema)
  .handler(async ({ data }) => {
    const session = await requireAdmin()

    const record = await updateMainCalculationRecord(data, session.user.id)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const finalizeMainCalculation = createServerFn({ method: 'POST' })
  .validator(mainCalculationIdSchema)
  .handler(async ({ data }) => {
    const session = await requireAdmin()

    const record = await finalizeMainCalculationRecord(data, session.user.id)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const deleteMainCalculation = createServerFn({ method: 'POST' })
  .validator(mainCalculationIdSchema)
  .handler(async ({ data }) => {
    await requireAdmin()

    const result = await deleteMainCalculationRecord(data)

    if (!result) {
      throw notFound()
    }

    return result
  })
