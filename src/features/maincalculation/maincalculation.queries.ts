import { keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'

import {
  getMainCalculation,
  listAvailableDailyCalculationsForMainCalc,
  listMainCalculation,
  previewMainCalculation,
} from './maincalculation.functions'
import {
  toListMainCalculationInput,
  type MainCalculationFilterValues,
} from './maincalculation.filters'
import type {
  AvailableDailyCalculationOption,
  ListMainCalculationInput,
  MainCalculationRecord,
  MainCalculationTotals,
  MainCalculationView,
} from './maincalculation.types'

export const mainCalculationKeys = {
  all: ['maincalculation'] as const,
  lists: () => [...mainCalculationKeys.all, 'list'] as const,
  list: (input: ListMainCalculationInput) =>
    [...mainCalculationKeys.lists(), input] as const,
  detail: (id: string) => [...mainCalculationKeys.all, 'detail', id] as const,
  preview: (input: {
    calculationDate: string
    totalTabil: number
    dailyCalculationId: string
    excludeMainCalculationId?: string
  }) => [...mainCalculationKeys.all, 'preview', input] as const,
  availableDailyCalculations: (excludeMainCalculationId?: string) =>
    [
      ...mainCalculationKeys.all,
      'availableDailyCalculations',
      excludeMainCalculationId ?? '',
    ] as const,
}

export function mainCalculationListQueryOptions(
  view: MainCalculationView,
  filters: MainCalculationFilterValues = {},
) {
  const input = toListMainCalculationInput(view, filters)

  return queryOptions({
    queryKey: mainCalculationKeys.list(input),
    queryFn: () =>
      listMainCalculation({ data: input }) as Promise<MainCalculationRecord[]>,
    placeholderData: keepPreviousData,
  })
}

export function mainCalculationDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: mainCalculationKeys.detail(id),
    queryFn: () =>
      getMainCalculation({ data: { id } }) as Promise<MainCalculationRecord>,
  })
}

export function previewMainCalculationQueryOptions(input: {
  calculationDate: string
  totalTabil: number
  dailyCalculationId: string
  excludeMainCalculationId?: string
}) {
  return queryOptions({
    queryKey: mainCalculationKeys.preview(input),
    queryFn: () =>
      previewMainCalculation({
        data: {
          calculationDate: new Date(`${input.calculationDate}T00:00:00`),
          totalTabil: input.totalTabil,
          dailyCalculationId: input.dailyCalculationId,
          excludeMainCalculationId: input.excludeMainCalculationId,
        },
      }) as Promise<MainCalculationTotals>,
    enabled: Boolean(input.calculationDate && input.dailyCalculationId),
    placeholderData: keepPreviousData,
  })
}

export function availableDailyCalculationsQueryOptions(
  excludeMainCalculationId?: string,
) {
  return queryOptions({
    queryKey: mainCalculationKeys.availableDailyCalculations(
      excludeMainCalculationId,
    ),
    queryFn: () =>
      listAvailableDailyCalculationsForMainCalc({
        data: excludeMainCalculationId
          ? { excludeMainCalculationId }
          : {},
      }) as Promise<AvailableDailyCalculationOption[]>,
  })
}

export function refetchMainCalculationLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: mainCalculationKeys.all })
}

export function refetchMainCalculationDetail(
  queryClient: QueryClient,
  id: string,
) {
  return queryClient.refetchQueries({
    queryKey: mainCalculationKeys.detail(id),
  })
}
