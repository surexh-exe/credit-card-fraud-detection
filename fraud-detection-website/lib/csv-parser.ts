export interface ParsedCSV {
  headers: string[]
  rows: Record<string, string | number>[]
  errors: string[]
}

export function parseCSV(content: string): ParsedCSV {
  const lines = content.trim().split("\n")
  const errors: string[] = []

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ["Empty file"] }
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows: Record<string, string | number>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      const values = parseCSVLine(line)
      const row: Record<string, string | number> = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""
        // Try to parse as number
        const numValue = Number(value)
        row[header] = !isNaN(numValue) && value !== "" ? numValue : value
      })

      row.id = row.id || `row-${i}`
      rows.push(row)
    } catch (e) {
      errors.push(`Error parsing line ${i + 1}`)
    }
  }

  return { headers, rows, errors }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// Generate sample transaction data for demonstration
export function generateSampleTransactions(count = 20): Record<string, string | number>[] {
  const merchants = [
    "Amazon",
    "Walmart",
    "Target",
    "Best Buy",
    "Apple Store",
    "Unknown Merchant",
    "Foreign ATM",
    "Gas Station",
  ]
  const categories = ["electronics", "grocery", "gas", "restaurant", "online", "atm", "jewelry", "gift_cards"]
  const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Unknown", "Foreign"]
  const cardTypes = ["Visa", "Mastercard", "Amex", "Discover"]

  return Array.from({ length: count }, (_, i) => {
    const isFraud = Math.random() > 0.85
    const baseAmount = isFraud ? Math.random() * 8000 + 500 : Math.random() * 500 + 10

    return {
      id: `TXN-${String(i + 1).padStart(5, "0")}`,
      amount: Math.round(baseAmount * 100) / 100,
      merchant: merchants[Math.floor(Math.random() * merchants.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      location:
        isFraud && Math.random() > 0.5 ? "Foreign" : locations[Math.floor(Math.random() * (locations.length - 2))],
      time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      cardType: cardTypes[Math.floor(Math.random() * cardTypes.length)],
      cardLast4: String(Math.floor(Math.random() * 9000) + 1000),
    }
  })
}

// Generate sample applicant data for credit scoring
export function generateSampleApplicants(count = 20): Record<string, string | number>[] {
  return Array.from({ length: count }, (_, i) => {
    const isGoodCredit = Math.random() > 0.4

    return {
      id: `APP-${String(i + 1).padStart(5, "0")}`,
      income: Math.round(isGoodCredit ? 60000 + Math.random() * 80000 : 25000 + Math.random() * 40000),
      loanAmount: Math.round(10000 + Math.random() * 40000),
      employmentLength: Math.round(isGoodCredit ? 3 + Math.random() * 15 : Math.random() * 5),
      creditHistory: Math.round(isGoodCredit ? 650 + Math.random() * 150 : 500 + Math.random() * 150),
      debtToIncome: Math.round((isGoodCredit ? 0.15 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3) * 100) / 100,
      ageOfCredit: Math.round(isGoodCredit ? 5 + Math.random() * 15 : Math.random() * 5),
      numAccounts: Math.round(2 + Math.random() * 8),
    }
  })
}
