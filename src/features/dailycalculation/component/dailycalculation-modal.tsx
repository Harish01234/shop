import { DailyCalculationForm } from './dailycalculation-form'
import type { DailyCalculationRecord } from '#/features/dailycalculation/dailycalculation.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DailyCalculationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: DailyCalculationRecord
  onSuccess: () => void
}

export function DailyCalculationModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: DailyCalculationModalProps) {
  const isEdit = Boolean(record)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,900px)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Daily Calculation' : 'Create Daily Calculation'}
          </DialogTitle>
          <DialogDescription>
            Enter Tabil and cash by hand. Asol, Sudh, and Deoya are calculated
            from the selected period.
          </DialogDescription>
        </DialogHeader>
        <DailyCalculationForm
          key={record?.id ?? 'new'}
          record={record}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => {
            onSuccess()
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
