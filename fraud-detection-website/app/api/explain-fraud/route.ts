import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { transaction, fraudScore, riskLevel } = await req.json()

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert fraud detection analyst. Provide a detailed explanation for why this transaction has been flagged.

Transaction Details:
${JSON.stringify(transaction, null, 2)}

Fraud Score: ${(fraudScore * 100).toFixed(1)}%
Risk Level: ${riskLevel}

Provide:
1. A clear explanation of the risk factors identified
2. Specific patterns that triggered the alert
3. Recommended actions for the fraud team

Keep your response concise but informative (max 200 words).`,
      maxOutputTokens: 300,
    })

    return Response.json({ explanation: text })
  } catch (error) {
    console.error("Explanation error:", error)
    return Response.json({ error: "Failed to generate explanation" }, { status: 500 })
  }
}
