import { notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import {
  createJinisSchema,
  jinisIdSchema,
  listJinisSchema,
  settleJinisSchema,
  updateJinisSchema,
} from './jinis.schema'
import {
  createJinisRecord,
  deleteJinisRecord,
  getJinisRecord,
  listJinisRecords,
  settleJinisRecord,
  sumActiveJinisCredit,
  updateJinisRecord,
} from './jinis.server'

async function requireUser() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/signin' })
  }

  return session.user
}

export const listJinis = createServerFn({ method: 'GET' })
  .validator(listJinisSchema)
  .handler(async ({ data }) => {
    await requireUser()
    return listJinisRecords(data)
  })

export const getActiveJinisTotal = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireUser()
    return sumActiveJinisCredit()
  },
)

export const getJinis = createServerFn({ method: 'GET' })
  .validator(jinisIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const jinis = await getJinisRecord(data)

    if (!jinis) {
      throw notFound()
    }

    return jinis
  })

export const createJinis = createServerFn({ method: 'POST' })
  .validator(createJinisSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()
    return createJinisRecord(data, user.id)
  })

export const updateJinis = createServerFn({ method: 'POST' })
  .validator(updateJinisSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const jinis = await updateJinisRecord(data)

    if (!jinis) {
      throw notFound()
    }

    return jinis
  })

export const settleJinis = createServerFn({ method: 'POST' })
  .validator(settleJinisSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const jinis = await settleJinisRecord(data)

    if (!jinis) {
      throw notFound()
    }

    return jinis
  })

export const deleteJinis = createServerFn({ method: 'POST' })
  .validator(jinisIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const result = await deleteJinisRecord(data)

    if (!result) {
      throw notFound()
    }

    return result
  })
