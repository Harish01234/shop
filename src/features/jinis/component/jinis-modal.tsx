import { JinisForm } from './jinis-form'
import type { JinisRecord } from '#/features/jinis/jinis.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type JinisModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  jinis?: JinisRecord
  onSuccess: () => void
}

export function JinisModal({
  open,
  onOpenChange,
  jinis,
  onSuccess,
}: JinisModalProps) {
  const isEdit = Boolean(jinis)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Jinis' : 'Create Jinis'}</DialogTitle>
          <DialogDescription>
            Loan against gold or silver. Weights are summed from the items.
          </DialogDescription>
        </DialogHeader>
        <JinisForm
          key={jinis?.id ?? 'new'}
          jinis={jinis}
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
