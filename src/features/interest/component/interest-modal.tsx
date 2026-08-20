import { InterestForm } from './interest-form'
import type { InterestRecord } from '#/features/interest/interest.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type InterestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  interest?: InterestRecord
  onSuccess: () => void
}

export function InterestModal({
  open,
  onOpenChange,
  interest,
  onSuccess,
}: InterestModalProps) {
  const isEdit = Boolean(interest)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Interest' : 'Create Interest'}
          </DialogTitle>
          <DialogDescription>
            Record a payment against a Jinis, JinisChara, or person.
          </DialogDescription>
        </DialogHeader>
        <InterestForm
          key={interest?.id ?? 'new'}
          interest={interest}
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
