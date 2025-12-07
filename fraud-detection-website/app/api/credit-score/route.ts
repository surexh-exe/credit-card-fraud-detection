import { generateText } from "ai"

export const maxDuration = 60

interface ApplicantData {
  id: string
  income: number
  loanAmount: number
  employmentLength: number
  creditHistory: number
  debtToIncome: number
  ageOfCredit: number
  numAccounts: number
  [key: string]: string | number
}

// Feature importance weights (SHAP-style)
const featureWeights = {
  income: 0.18,
  loanAmount: 0.15,
  employmentLength: 0.12,
  creditHistory: 0.2,
  debtToIncome: 0.18,
  ageOfCredit: 0.1,
  numAccounts: 0.07,
}

function calculateCreditScore(applicant: ApplicantData): number {
  let score = 500 // Base score

  // Income factor
  const income = Number(applicant.income) || 0
  if (income > 100000) score += 80
  else if (income > 70000) score += 60
  else if (income > 50000) score += 40
  else if (income > 30000) score += 20

  // Loan amount to income ratio
  const loanAmount = Number(applicant.loanAmount) || 0
  const loanToIncome = income > 0 ? loanAmount / income : 1
  if (loanToIncome < 2) score += 50
  else if (loanToIncome < 4) score += 25
  else score -= 30

  // Employment length
  const empLength = Number(applicant.employmentLength) || 0
  score += Math.min(empLength * 5, 50)

  // Credit history
  const creditHist = Number(applicant.creditHistory) || 0
  if (creditHist >= 700) score += 100
  else if (creditHist >= 650) score += 60
  else if (creditHist >= 600) score += 30
  else score -= 50

  // Debt to income ratio
  const dti = Number(applicant.debtToIncome) || 0
  if (dti < 0.2) score += 60
  else if (dti < 0.35) score += 30
  else if (dti > 0.5) score -= 50

  // Age of credit
  const ageCredit = Number(applicant.ageOfCredit) || 0
  score += Math.min(ageCredit * 3, 40)

  // Normalize to 300-850 range
  return Math.max(300, Math.min(850, score))
}

function getRiskGroup(score: number): "Prime" | "Near-prime" | "Subprime" {
  if (score >= 700) return "Prime"
  if (score >= 600) return "Near-prime"
  return "Subprime"
}

function getFeatureImportance(
  applicant: ApplicantData,
): Array<{ feature: string; importance: number; impact: "positive" | "negative" | "neutral" }> {
  const importance = []

  const income = Number(applicant.income) || 0
  importance.push({
    feature: "Annual Income",
    importance: featureWeights.income * 100,
    impact: income > 50000 ? "positive" : income < 30000 ? "negative" : "neutral",
  })

  const creditHist = Number(applicant.creditHistory) || 0
  importance.push({
    feature: "Credit History",
    importance: featureWeights.creditHistory * 100,
    impact: creditHist >= 650 ? "positive" : creditHist < 600 ? "negative" : "neutral",
  })

  const dti = Number(applicant.debtToIncome) || 0
  importance.push({
    feature: "Debt-to-Income",
    importance: featureWeights.debtToIncome * 100,
    impact: dti < 0.35 ? "positive" : dti > 0.5 ? "negative" : "neutral",
  })

  const loanAmount = Number(applicant.loanAmount) || 0
  importance.push({
    feature: "Loan Amount",
    importance: featureWeights.loanAmount * 100,
    impact: income > 0 && loanAmount / income < 3 ? "positive" : "negative",
  })

  const empLength = Number(applicant.employmentLength) || 0
  importance.push({
    feature: "Employment Length",
    importance: featureWeights.employmentLength * 100,
    impact: empLength >= 3 ? "positive" : empLength < 1 ? "negative" : "neutral",
  })

  return importance.sort((a, b) => b.importance - a.importance)
}

export async function POST(req: Request) {
  try {
    const { applicants, generateExplanations } = await req.json()

    const scoredApplicants = []

    for (const applicant of applicants.slice(0, 50)) {
      const creditScore = calculateCreditScore(applicant)
      const riskGroup = getRiskGroup(creditScore)
      const featureImportance = getFeatureImportance(applicant)

      let explanation = ""

      if (generateExplanations) {
        const { text } = await generateText({
          model: "openai/gpt-4o-mini",
          prompt: `You are a credit scoring AI expert. Provide a brief 2-3 sentence explanation for this credit assessment.

Applicant Profile:
- Income: $${applicant.income || "Not provided"}
- Loan Amount Requested: $${applicant.loanAmount || "Not provided"}
- Employment Length: ${applicant.employmentLength || "Not provided"} years
- Credit History Score: ${applicant.creditHistory || "Not provided"}
- Debt-to-Income Ratio: ${((Number(applicant.debtToIncome) || 0) * 100).toFixed(1)}%
- Predicted Credit Score: ${creditScore}
- Risk Group: ${riskGroup}

Explain the key factors influencing this score in plain language.`,
          maxOutputTokens: 150,
        })
        explanation = text
      } else {
        const topFactors = featureImportance.slice(0, 3)
        const positives = topFactors.filter((f) => f.impact === "positive").map((f) => f.feature)
        const negatives = topFactors.filter((f) => f.impact === "negative").map((f) => f.feature)

        const parts = []
        if (positives.length) parts.push(`Strong factors: ${positives.join(", ")}`)
        if (negatives.length) parts.push(`Areas of concern: ${negatives.join(", ")}`)
        explanation = parts.join(". ") || "Standard credit profile."
      }

      scoredApplicants.push({
        ...applicant,
        creditScore,
        riskGroup,
        featureImportance,
        explanation,
        approved: creditScore >= 620,
      })
    }

    // Calculate distribution
    const distribution = {
      prime: scoredApplicants.filter((a) => a.riskGroup === "Prime").length,
      nearPrime: scoredApplicants.filter((a) => a.riskGroup === "Near-prime").length,
      subprime: scoredApplicants.filter((a) => a.riskGroup === "Subprime").length,
      avgScore: scoredApplicants.reduce((sum, a) => sum + a.creditScore, 0) / scoredApplicants.length,
      approvalRate: (scoredApplicants.filter((a) => a.approved).length / scoredApplicants.length) * 100,
    }

    return Response.json({
      applicants: scoredApplicants,
      distribution,
    })
  } catch (error) {
    console.error("Credit scoring error:", error)
    return Response.json({ error: "Failed to score applicants" }, { status: 500 })
  }
}
