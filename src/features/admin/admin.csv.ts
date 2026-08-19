export type CsvJinisPreviewRow = {
  rowNumber: number
  slNo: number | null
  name: string
  fatherName: string
  date: string
  credit: number | null
  phoneNo: string
  error: string | null
}

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parseCsvTable(text: string) {
  const source = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const firstLine = source.split('\n').find((line) => line.trim()) ?? ''
  const commaCount = (firstLine.match(/,/g) ?? []).length
  const semicolonCount = (firstLine.match(/;/g) ?? []).length
  const tabCount = (firstLine.match(/\t/g) ?? []).length
  const delimiter =
    tabCount > commaCount && tabCount > semicolonCount
      ? '\t'
      : semicolonCount > commaCount
        ? ';'
        : ','

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
      continue
    }

    if (char === delimiter) {
      row.push(cell.trim())
      cell = ''
      continue
    }

    if (char === '\n') {
      row.push(cell.trim())
      cell = ''
      if (row.some((value) => value !== '')) {
        rows.push(row)
      }
      row = []
      continue
    }

    cell += char
  }

  if (cell || row.length > 0) {
    row.push(cell.trim())
    if (row.some((value) => value !== '')) {
      rows.push(row)
    }
  }

  return rows
}

function headerIndex(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header))
}

function parseCredit(value: string) {
  const cleaned = value.replace(/[₹rsRS,\s]/g, '').replace(/[^\d.-]/g, '')
  if (!cleaned) return null
  const amount = Number(cleaned)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return Math.round(amount)
}

function parseDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const slash = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (slash) {
    const month = Number(slash[1])
    const day = Number(slash[2])
    const year = Number(slash[3].length === 2 ? `20${slash[3]}` : slash[3])
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const serial = Number(trimmed)
  if (Number.isInteger(serial) && serial > 20000 && serial < 80000) {
    const date = new Date(Date.UTC(1899, 11, 30 + serial))
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

function toDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseJinisCsv(text: string): CsvJinisPreviewRow[] {
  const table = parseCsvTable(text)
  const headerRowIndex = table.findIndex((row) => {
    const headers = row.map(normalizeHeader)
    return (
      headerIndex(headers, ['sl no', 'slno', 's no', 'serial no', 'serial']) >= 0 &&
      headerIndex(headers, ['name']) >= 0
    )
  })

  if (headerRowIndex < 0) {
    throw new Error(
      'Could not find the header row. Use columns: Sl no, NAME, Father\'s Name, Date, credit.',
    )
  }

  const headers = table[headerRowIndex].map(normalizeHeader)
  const slNoIndex = headerIndex(headers, ['sl no', 'slno', 's no', 'serial no', 'serial'])
  const nameIndex = headerIndex(headers, ['name'])
  const fatherIndex = headerIndex(headers, [
    'fathers name',
    'father name',
    'father',
  ])
  const dateIndex = headerIndex(headers, ['date'])
  const creditIndex = headerIndex(headers, ['credit'])
  const phoneIndex = headerIndex(headers, ['phone no', 'phone', 'phoneno', 'mobile'])

  if (slNoIndex < 0 || nameIndex < 0 || fatherIndex < 0 || dateIndex < 0 || creditIndex < 0) {
    throw new Error(
      'CSV must include Sl no, NAME, Father\'s Name, Date, and credit.',
    )
  }

  return table.slice(headerRowIndex + 1).flatMap((row, offset) => {
    const rowNumber = headerRowIndex + offset + 2
    const slNoRaw = row[slNoIndex] ?? ''
    const name = (row[nameIndex] ?? '').trim()
    const fatherName = (row[fatherIndex] ?? '').trim()
    const dateRaw = row[dateIndex] ?? ''
    const creditRaw = row[creditIndex] ?? ''
    const phoneNo = (phoneIndex >= 0 ? row[phoneIndex] : '')?.trim() || '-'

    if (!slNoRaw && !name && !fatherName && !dateRaw && !creditRaw) {
      return []
    }

    const slNo = Number(slNoRaw.replace(/[^\d]/g, ''))
    const date = parseDate(dateRaw)
    const credit = parseCredit(creditRaw)
    const errors: string[] = []

    if (!Number.isInteger(slNo) || slNo <= 0) errors.push('Serial no is missing')
    if (!name) errors.push('Name is missing')
    if (!fatherName) errors.push('Father name is missing')
    if (!date) errors.push('Date is invalid')
    if (!credit) errors.push('Credit is invalid')

    return [
      {
        rowNumber,
        slNo: Number.isInteger(slNo) && slNo > 0 ? slNo : null,
        name,
        fatherName,
        date: date ? toDateInput(date) : dateRaw,
        credit,
        phoneNo,
        error: errors.length ? errors.join('. ') : null,
      },
    ]
  })
}
