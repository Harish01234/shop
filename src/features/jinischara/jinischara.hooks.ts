import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'

import {
  createJinisChara,
  deleteJinisChara,
  updateJinisChara,
} from './jinischara.functions'
import type { JinisCharaFilterValues } from './jinischara.filters'
import {
  jinisCharaListQueryOptions,
  refetchJinisCharaLists,
} from './jinischara.queries'
import type {
  CreateJinisCharaInput,
  JinisCharaRecord,
  JinisCharaView,
  UpdateJinisCharaInput,
} from './jinischara.types'
import { toast } from '@/components/ui/toast'

export function useJinisCharaList(
  view: JinisCharaView,
  filters: JinisCharaFilterValues = {},
) {
  return useQuery(jinisCharaListQueryOptions(view, filters))
}

export function useCreateJinisChara() {
  const queryClient = useQueryClient()
  const createJinisCharaFn = useServerFn(createJinisChara)

  return useMutation({
    mutationFn: (data: CreateJinisCharaInput) => createJinisCharaFn({ data }),
    onSuccess: async () => {
      await refetchJinisCharaLists(queryClient)
      toast.add({
        title: 'JinisChara created successfully',
        type: 'success',
      })
    },
  })
}

export function useUpdateJinisChara() {
  const queryClient = useQueryClient()
  const updateJinisCharaFn = useServerFn(updateJinisChara)

  return useMutation({
    mutationFn: (data: UpdateJinisCharaInput) => updateJinisCharaFn({ data }),
    onSuccess: async () => {
      await refetchJinisCharaLists(queryClient)
      toast.add({
        title: 'JinisChara updated successfully',
        type: 'success',
      })
    },
  })
}

export function useDeleteJinisChara() {
  const queryClient = useQueryClient()
  const deleteJinisCharaFn = useServerFn(deleteJinisChara)

  return useMutation({
    mutationFn: (record: JinisCharaRecord) =>
      deleteJinisCharaFn({ data: { id: record.id } }),
    onSuccess: async () => {
      await refetchJinisCharaLists(queryClient)
      toast.add({
        title: 'JinisChara deleted successfully',
        type: 'success',
      })
    },
    onError: () => {
      toast.add({
        title: 'Could not delete JinisChara',
        description: 'It may have linked payments.',
        type: 'error',
      })
    },
  })
}

export function useToggleJinisChara() {
  const queryClient = useQueryClient()
  const updateJinisCharaFn = useServerFn(updateJinisChara)

  return useMutation({
    mutationFn: ({
      record,
      active,
    }: {
      record: JinisCharaRecord
      active: boolean
    }) =>
      updateJinisCharaFn({
        data: {
          id: record.id,
          active,
          settledAt: active ? null : new Date(),
        },
      }),
    onSuccess: async () => {
      await refetchJinisCharaLists(queryClient)
    },
    onError: () => {
      toast.add({
        title: 'Could not update status',
        description: 'Please try again.',
        type: 'error',
      })
    },
  })
}
