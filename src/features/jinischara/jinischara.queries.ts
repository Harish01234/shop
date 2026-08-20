import { keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'

import { getActiveJinisCharaTotal, listJinisChara } from './jinischara.functions'
import {
  toListJinisCharaInput,
  type JinisCharaFilterValues,
} from './jinischara.filters'
import type {
  JinisCharaRecord,
  JinisCharaView,
  ListJinisCharaInput,
} from './jinischara.types'

export const jinisCharaKeys = {
  all: ['jinischara'] as const,
  lists: () => [...jinisCharaKeys.all, 'list'] as const,
  list: (input: ListJinisCharaInput) =>
    [...jinisCharaKeys.lists(), input] as const,
  activeTotal: () => [...jinisCharaKeys.all, 'activeTotal'] as const,
}

export function jinisCharaListQueryOptions(
  view: JinisCharaView,
  filters: JinisCharaFilterValues = {},
) {
  const input = toListJinisCharaInput(view, filters)

  return queryOptions({
    queryKey: jinisCharaKeys.list(input),
    queryFn: () => listJinisChara({ data: input }) as Promise<JinisCharaRecord[]>,
    placeholderData: keepPreviousData,
  })
}

export function activeJinisCharaTotalQueryOptions() {
  return queryOptions({
    queryKey: jinisCharaKeys.activeTotal(),
    queryFn: () => getActiveJinisCharaTotal() as Promise<number>,
  })
}

export function refetchJinisCharaLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: jinisCharaKeys.all })
}
