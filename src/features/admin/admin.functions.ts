import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import { isAdminRole } from '#/lib/admin-role'
import {
  adminDeleteAllJinisSchema,
  adminExportSchema,
  adminJinisImportSchema,
  adminSessionIdSchema,
} from './admin.schema'
import {
  deleteAllJinisRecords,
  exportAdminData,
  getAdminOverview,
  importJinisCsv,
  listAdminSessions,
  revokeAdminSession,
} from './admin.server'

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

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireAdmin()
    return getAdminOverview(session.session.id)
  },
)

export const listSessions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireAdmin()
    return listAdminSessions(session.session.id)
  },
)

export const revokeSession = createServerFn({ method: 'POST' })
  .validator(adminSessionIdSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const result = await revokeAdminSession(data.id)

    if (!result) {
      throw new Error('Session was not found.')
    }

    return result
  })

export const importJinis = createServerFn({ method: 'POST' })
  .validator(adminJinisImportSchema)
  .handler(async ({ data }) => {
    const session = await requireAdmin()
    return importJinisCsv(data, session.user.id)
  })

export const deleteAllJinis = createServerFn({ method: 'POST' })
  .validator(adminDeleteAllJinisSchema)
  .handler(async () => {
    await requireAdmin()
    return deleteAllJinisRecords()
  })

export const exportData = createServerFn({ method: 'POST' })
  .validator(adminExportSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    return exportAdminData(data)
  })
