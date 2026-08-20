import { keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'

import { getTotalInterest, listInterest } from './interest.functions'
import {
  toListInterestInput,
  type InterestFilterValues,
} from './interest.filters'
import type {
  InterestRecord,
  InterestSource,
  ListInterestInput,
} from './interest.types'

export const interestKeys = {
  all: ['interest'] as const,
  lists: () => [...interestKeys.all, 'list'] as const,
  list: (input: ListInterestInput) => [...interestKeys.lists(), input] as const,
  total: () => [...interestKeys.all, 'total'] as const,
}

export function interestListQueryOptions(
  source: InterestSource = 'all',
  filters: InterestFilterValues = {},
) {
  const input = toListInterestInput(source, filters)

  return queryOptions({
    queryKey: interestKeys.list(input),
    queryFn: () => listInterest({ data: input }) as Promise<InterestRecord[]>,
    placeholderData: keepPreviousData,
  })
}

export function totalInterestQueryOptions() {
  return queryOptions({
    queryKey: interestKeys.total(),
    queryFn: () => getTotalInterest() as Promise<number>,
  })
}

export function refetchInterestLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: interestKeys.all })
}
