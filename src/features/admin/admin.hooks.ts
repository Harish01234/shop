import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'

import { refetchJinisLists } from '#/features/jinis/jinis.queries'
import { refetchInterestLists } from '#/features/interest/interest.queries'
import {
  deleteAllJinis,
  exportData,
  importJinis,
  revokeSession,
} from './admin.functions'
import {
  adminOverviewQueryOptions,
  adminSessionsQueryOptions,
  refetchAdminOverview,
  refetchAdminSessions,
} from './admin.queries'
import type {
  AdminExportInput,
  AdminJinisImportInput,
  AdminSessionRecord,
} from './admin.types'
import { toast } from '@/components/ui/toast'

export function useAdminOverview() {
  return useQuery(adminOverviewQueryOptions())
}

export function useAdminSessions() {
  return useQuery(adminSessionsQueryOptions())
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  const revokeSessionFn = useServerFn(revokeSession)

  return useMutation({
    mutationFn: (record: AdminSessionRecord) =>
      revokeSessionFn({ data: { id: record.id } }),
    onMutate: async (record) => {
      await queryClient.cancelQueries({ queryKey: adminSessionsQueryOptions().queryKey })
      const previous = queryClient.getQueryData<AdminSessionRecord[]>(
        adminSessionsQueryOptions().queryKey,
      )
      queryClient.setQueryData<AdminSessionRecord[]>(
        adminSessionsQueryOptions().queryKey,
        (current) => (current ?? []).filter((item) => item.id !== record.id),
      )
      return { previous }
    },
    onError: (_error, _record, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          adminSessionsQueryOptions().queryKey,
          context.previous,
        )
      }
      toast.add({
        title: 'Could not end session',
        description: 'Please try again.',
        type: 'error',
      })
    },
    onSuccess: async () => {
      toast.add({
        title: 'Session ended',
        type: 'success',
      })
      await Promise.all([
        refetchAdminSessions(queryClient),
        refetchAdminOverview(queryClient),
      ])
    },
  })
}

export function useImportJinis() {
  const queryClient = useQueryClient()
  const importJinisFn = useServerFn(importJinis)

  return useMutation({
    mutationFn: (data: AdminJinisImportInput) => importJinisFn({ data }),
    onSuccess: async (result) => {
      toast.add({
        title: 'Jinis imported',
        description: `${result.imported} added. ${result.skipped} skipped as already present.`,
        type: 'success',
      })
      await Promise.all([
        refetchJinisLists(queryClient),
        refetchAdminOverview(queryClient),
      ])
    },
    onError: () => {
      toast.add({
        title: 'Could not import Jinis',
        description: 'Please check the preview and try again.',
        type: 'error',
      })
    },
  })
}

export function useDeleteAllJinis() {
  const queryClient = useQueryClient()
  const deleteAllJinisFn = useServerFn(deleteAllJinis)

  return useMutation({
    mutationFn: () => deleteAllJinisFn({ data: {} }),
    onSuccess: async (result) => {
      toast.add({
        title: 'Jinis deleted',
        description:
          result.paymentsDeleted > 0
            ? `${result.deleted} Jinis removed, including ${result.paymentsDeleted} linked payments.`
            : `${result.deleted} Jinis removed.`,
        type: 'success',
      })
      await Promise.all([
        refetchJinisLists(queryClient),
        refetchInterestLists(queryClient),
        refetchAdminOverview(queryClient),
      ])
    },
    onError: () => {
      toast.add({
        title: 'Could not delete Jinis',
        description: 'Please try again.',
        type: 'error',
      })
    },
  })
}

export function useExportData() {
  const exportDataFn = useServerFn(exportData)

  return useMutation({
    mutationFn: (data: AdminExportInput) => exportDataFn({ data }),
    onSuccess: (file) => {
      const blob = new Blob([file.content], { type: file.mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.filename
      link.click()
      URL.revokeObjectURL(url)
      toast.add({
        title: 'Export ready',
        description: file.filename,
        type: 'success',
      })
    },
    onError: () => {
      toast.add({
        title: 'Could not export data',
        description: 'Please try again.',
        type: 'error',
      })
    },
  })
}
