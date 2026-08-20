import { notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import {
  createInterestSchema,
  interestIdSchema,
  listInterestSchema,
  updateInterestSchema,
} from './interest.schema'
import {
  createInterestRecord,
  deleteInterestRecord,
  getInterestRecord,
  listInterestRecords,
  sumInterestAmount,
  updateInterestRecord,
} from './interest.server'

async function requireUser() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/signin' })
  }

  return session.user
}

export const listInterest = createServerFn({ method: 'GET' })
  .validator(listInterestSchema)
  .handler(async ({ data }) => {
    await requireUser()
    return listInterestRecords(data)
  })

export const getTotalInterest = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireUser()
    return sumInterestAmount()
  },
)

export const getInterest = createServerFn({ method: 'GET' })
  .validator(interestIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const record = await getInterestRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const createInterest = createServerFn({ method: 'POST' })
  .validator(createInterestSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()
    return createInterestRecord(data, user.id)
  })

export const updateInterest = createServerFn({ method: 'POST' })
  .validator(updateInterestSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const record = await updateInterestRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const deleteInterest = createServerFn({ method: 'POST' })
  .validator(interestIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const result = await deleteInterestRecord(data)

    if (!result) {
      throw notFound()
    }

    return result
  })
