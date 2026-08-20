import { notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import {
  createJinisCharaSchema,
  jinisCharaIdSchema,
  listJinisCharaSchema,
  settleJinisCharaSchema,
  updateJinisCharaSchema,
} from './jinischara.schema'
import {
  createJinisCharaRecord,
  deleteJinisCharaRecord,
  getJinisCharaRecord,
  listJinisCharaRecords,
  settleJinisCharaRecord,
  updateJinisCharaRecord,
} from './jinischara.server'

async function requireUser() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: '/signin' })
  }

  return session.user
}

export const listJinisChara = createServerFn({ method: 'GET' })
  .validator(listJinisCharaSchema)
  .handler(async ({ data }) => {
    await requireUser()
    return listJinisCharaRecords(data)
  })

export const getJinisChara = createServerFn({ method: 'GET' })
  .validator(jinisCharaIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const record = await getJinisCharaRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const createJinisChara = createServerFn({ method: 'POST' })
  .validator(createJinisCharaSchema)
  .handler(async ({ data }) => {
    const user = await requireUser()
    return createJinisCharaRecord(data, user.id)
  })

export const updateJinisChara = createServerFn({ method: 'POST' })
  .validator(updateJinisCharaSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const record = await updateJinisCharaRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const settleJinisChara = createServerFn({ method: 'POST' })
  .validator(settleJinisCharaSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const record = await settleJinisCharaRecord(data)

    if (!record) {
      throw notFound()
    }

    return record
  })

export const deleteJinisChara = createServerFn({ method: 'POST' })
  .validator(jinisCharaIdSchema)
  .handler(async ({ data }) => {
    await requireUser()

    const result = await deleteJinisCharaRecord(data)

    if (!result) {
      throw notFound()
    }

    return result
  })
