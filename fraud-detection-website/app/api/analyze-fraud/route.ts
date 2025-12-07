export const maxDuration = 60

interface TransactionData {
  id: string
  amount: number
  merchant: string
  category: string
  location: string
  time: string
  cardType: string
  [key: string]: string | number
}

function calculateFraudScore(transaction: TransactionData): number {
  let score = 0

  // Amount-based risk
  const amount = Number(transaction.amount) || 0
  if (amount > 5000) score += 0.3
  else if (amount > 1000) score += 0.15
  else if (amount > 500) score += 0.05

  // Category risk
  const highRiskCategories = ["electronics", "jewelry", "gift_cards", "cryptocurrency"]
  if (highRiskCategories.includes(String(transaction.category).toLowerCase())) {
    score += 0.2
  }

  // Time-based risk (night transactions)
  const hour = new Date(transaction.time).getHours()
  if (hour >= 0 && hour <= 5) score += 0.15

  // Credit ratio risk (for Kaggle data)
  const creditRatio = Number(transaction.creditRatio) || 0
  if (creditRatio > 0.5) score += 0.2
  else if (creditRatio > 0.3) score += 0.1

  // External scores (for Kaggle data)
  const extScore1 = Number(transaction.extScore1) || 0.5
  const extScore2 = Number(transaction.extScore2) || 0.5
  const extScore3 = Number(transaction.extScore3) || 0.5
  const avgExtScore = (extScore1 + extScore2 + extScore3) / 3
  if (avgExtScore < 0.3) score += 0.25

  // Random factor for demonstration
  score += Math.random() * 0.15

  return Math.min(score, 1)
}

function getRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score < 0.3) return "Low"
  if (score < 0.6) return "Medium"
  return "High"
}

function generateRuleBasedExplanation(transaction: TransactionData, fraudScore: number): string {
  const reasons: string[] = []
  const amount = Number(transaction.amount) || 0

  if (amount > 5000) {
    reasons.push(
      `Very high transaction amount ($${amount.toLocaleString()}) significantly exceeds typical spending patterns`,
    )
  } else if (amount > 1000) {
    reasons.push(`Elevated transaction amount ($${amount.toLocaleString()}) warrants additional scrutiny`)
  }

  const highRiskCategories = ["electronics", "jewelry", "gift_cards", "cryptocurrency"]
  if (highRiskCategories.includes(String(transaction.category).toLowerCase())) {
    reasons.push(`Transaction category "${transaction.category}" is commonly associated with fraudulent activity`)
  }

  const hour = new Date(transaction.time).getHours()
  if (hour >= 0 && hour <= 5) {
    reasons.push(`Transaction occurred at ${hour}:00 AM, an unusual time that may indicate compromised credentials`)
  }

  // Kaggle data specific factors
  const creditRatio = Number(transaction.creditRatio) || 0
  if (creditRatio > 0.5) {
    reasons.push(`Credit-to-income ratio of ${(creditRatio * 100).toFixed(1)}% indicates potential overextension`)
  }

  const extScore1 = Number(transaction.extScore1) || 0
  const extScore2 = Number(transaction.extScore2) || 0
  const extScore3 = Number(transaction.extScore3) || 0

  if (extScore1 > 0 || extScore2 > 0 || extScore3 > 0) {
    const avgExtScore = (extScore1 + extScore2 + extScore3) / 3
    if (avgExtScore < 0.3) {
      reasons.push(`Low external credit scores (avg: ${(avgExtScore * 100).toFixed(0)}%) suggest elevated risk profile`)
    }
  }

  if (reasons.length === 0) {
    if (fraudScore > 0.6) {
      reasons.push("Multiple minor risk indicators combine to create elevated risk profile")
    } else if (fraudScore > 0.3) {
      reasons.push("Some risk factors detected but within acceptable thresholds")
    } else {
      reasons.push("Transaction appears normal with no significant risk indicators")
    }
  }

  return reasons.join(". ") + "."
}

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json()

    if (!transactions || !Array.isArray(transactions)) {
      return Response.json({
        transactions: [],
        summary: {
          totalTransactions: 0,
          fraudCount: 0,
          genuineCount: 0,
          avgFraudScore: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0,
        },
      })
    }

    const analyzedTransactions = []

    for (const transaction of transactions.slice(0, 50)) {
      const fraudScore = calculateFraudScore(transaction)
      const riskLevel = getRiskLevel(fraudScore)

      const explanation = generateRuleBasedExplanation(transaction, fraudScore)

      analyzedTransactions.push({
        ...transaction,
        id: transaction.id || `TXN-${Math.random().toString(36).substr(2, 9)}`,
        fraudScore,
        riskLevel,
        explanation,
        flagged: fraudScore > 0.5,
      })
    }

    const summary = {
      totalTransactions: analyzedTransactions.length,
      fraudCount: analyzedTransactions.filter((t) => t.flagged).length,
      genuineCount: analyzedTransactions.filter((t) => !t.flagged).length,
      avgFraudScore:
        analyzedTransactions.length > 0
          ? analyzedTransactions.reduce((sum, t) => sum + t.fraudScore, 0) / analyzedTransactions.length
          : 0,
      highRiskCount: analyzedTransactions.filter((t) => t.riskLevel === "High").length,
      mediumRiskCount: analyzedTransactions.filter((t) => t.riskLevel === "Medium").length,
      lowRiskCount: analyzedTransactions.filter((t) => t.riskLevel === "Low").length,
    }

    return Response.json({
      transactions: analyzedTransactions,
      summary,
    })
  } catch (error) {
    console.error("Fraud analysis error:", error)
    return Response.json({
      transactions: [],
      summary: {
        totalTransactions: 0,
        fraudCount: 0,
        genuineCount: 0,
        avgFraudScore: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
      },
      error: "Analysis encountered an issue. Please try again.",
    })
  }
}
