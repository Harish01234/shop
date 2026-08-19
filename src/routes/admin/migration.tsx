import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { AdminJinisPreviewTable } from '#/features/admin/admin-jinis-preview-table'
import { parseJinisCsv, type CsvJinisPreviewRow } from '#/features/admin/admin.csv'
import { useImportJinis } from '#/features/admin/admin.hooks'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { AlertCircleIcon } from 'lucide-react'

export const Route = createFileRoute('/admin/migration')({
  component: AdminMigrationPage,
})

function AdminMigrationPage() {
  const importJinisMutation = useImportJinis()
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<CsvJinisPreviewRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const validRows = rows.filter((row) => !row.error)
  const errorCount = rows.length - validRows.length

  async function handleFile(file: File | undefined) {
    setParseError(null)
    setRows([])
    setFileName(null)

    if (!file) return

    try {
      const text = await file.text()
      const parsed = parseJinisCsv(text)
      setFileName(file.name)
      setRows(parsed)
    } catch (error) {
      setParseError(
        error instanceof Error
          ? error.message
          : 'Could not read this CSV file.',
      )
    }
  }

  async function confirmImport() {
    setConfirmOpen(false)
    await importJinisMutation
      .mutateAsync({
        rows: validRows.map((row) => ({
          slNo: row.slNo as number,
          name: row.name,
          fatherName: row.fatherName,
          date: new Date(row.date),
          credit: row.credit as number,
          phoneNo: row.phoneNo,
        })),
      })
      .then(() => {
        setRows([])
        setFileName(null)
      })
      .catch(() => {})
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Migration
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a Jinis CSV, check the preview, then import.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Header row can sit below totals. Needed columns: Sl no, NAME,
            Father's Name, Date, credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              void handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          {fileName ? (
            <p className="text-sm text-muted-foreground">{fileName}</p>
          ) : null}
        </CardContent>
      </Card>

      {parseError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not read CSV</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {validRows.length} ready
              {errorCount ? ` · ${errorCount} with errors` : ''}
            </p>
            <Button
              type="button"
              disabled={validRows.length === 0 || importJinisMutation.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              {importJinisMutation.isPending ? <Spinner /> : null}
              Import {validRows.length} Jinis
            </Button>
          </div>
          <AdminJinisPreviewTable records={rows} />
        </>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import these Jinis?</AlertDialogTitle>
            <AlertDialogDescription>
              {validRows.length} rows will be added. Rows with errors are
              skipped. Existing serial numbers are not imported again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'bg-background',
              )}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={importJinisMutation.isPending}
              onClick={() => void confirmImport()}
            >
              {importJinisMutation.isPending ? <Spinner /> : null}
              Import
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
