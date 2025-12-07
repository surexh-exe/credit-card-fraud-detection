import { generateText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { application } = await req.json()

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert credit risk analyst using Explainable AI (XAI) techniques. Analyze this loan application from the Home Credit Default Risk dataset and explain why it has been flagged with its current risk level.

Application Details:
- Application ID: ${application.SK_ID_CURR}
- Contract Type: ${application.NAME_CONTRACT_TYPE}
- Gender: ${application.CODE_GENDER}
- Age: ${application.AGE_YEARS} years
- Income: $${application.AMT_INCOME_TOTAL?.toLocaleString()}
- Credit Amount: $${application.AMT_CREDIT?.toLocaleString()}
- Annuity: $${application.AMT_ANNUITY?.toLocaleString()}
- Credit/Income Ratio: ${application.CREDIT_INCOME_RATIO}x
- Annuity/Income Ratio: ${(application.ANNUITY_INCOME_RATIO * 100).toFixed(1)}%
- Employment: ${application.EMPLOYED_YEARS} years (${application.NAME_INCOME_TYPE})
- Occupation: ${application.OCCUPATION_TYPE}
- Education: ${application.NAME_EDUCATION_TYPE}
- Family Status: ${application.NAME_FAMILY_STATUS}
- Children: ${application.CNT_CHILDREN}
- Owns Car: ${application.FLAG_OWN_CAR}
- Owns Realty: ${application.FLAG_OWN_REALTY}
- External Score 1: ${application.EXT_SOURCE_1?.toFixed(3)}
- External Score 2: ${application.EXT_SOURCE_2?.toFixed(3)}
- External Score 3: ${application.EXT_SOURCE_3?.toFixed(3)}
- Risk Score: ${application.RISK_SCORE}%
- Risk Level: ${application.RISK_LEVEL}
- Target (Default): ${application.TARGET === 1 ? "Yes (Defaulted)" : "No (Did not default)"}

Provide an XAI-style explanation that includes:
1. The top 3 risk factors contributing to this assessment
2. How each factor impacts the default probability (positive or negative)
3. A brief recommendation for the credit decision

Keep your response concise (max 200 words) and professional.`,
      maxOutputTokens: 350,
    })

    return Response.json({ explanation: text })
  } catch (error) {
    console.error("Explanation error:", error)
    return Response.json(
      {
        explanation:
          "Unable to generate AI explanation at this time. The risk assessment is based on credit-to-income ratio, employment stability, external credit scores, and historical patterns from the Home Credit dataset.",
      },
      { status: 200 },
    )
  }
}
