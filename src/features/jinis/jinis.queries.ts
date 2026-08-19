import { queryOptions, type QueryClient } from '@tanstack/react-query'

import { listJinis } from './jinis.functions'
import type { JinisRecord, JinisView } from './jinis.types'

export const jinisKeys = {
  all: ['jinis'] as const,
  lists: () => [...jinisKeys.all, 'list'] as const,
  list: (view: JinisView) => [...jinisKeys.lists(), view] as const,
}

export function activeFilterForView(view: JinisView) {
  if (view === 'open') return true
  if (view === 'settled') return false
  return undefined
}

export function jinisListQueryOptions(view: JinisView) {
  const active = activeFilterForView(view)

  return queryOptions({
    queryKey: jinisKeys.list(view),
    queryFn: () =>
      listJinis({
        data: active === undefined ? {} : { active },
      }) as Promise<JinisRecord[]>,
  })
}

export function refetchJinisLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: jinisKeys.lists() })
}
