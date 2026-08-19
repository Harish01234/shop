import { keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'

import { listJinis } from './jinis.functions'
import {
  toListJinisInput,
  type JinisFilterValues,
} from './jinis.filters'
import type { JinisRecord, JinisView, ListJinisInput } from './jinis.types'

export const jinisKeys = {
  all: ['jinis'] as const,
  lists: () => [...jinisKeys.all, 'list'] as const,
  list: (input: ListJinisInput) => [...jinisKeys.lists(), input] as const,
}

export function jinisListQueryOptions(
  view: JinisView,
  filters: JinisFilterValues = {},
) {
  const input = toListJinisInput(view, filters)

  return queryOptions({
    queryKey: jinisKeys.list(input),
    queryFn: () => listJinis({ data: input }) as Promise<JinisRecord[]>,
    placeholderData: keepPreviousData,
  })
}

export function refetchJinisLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: jinisKeys.lists() })
}
