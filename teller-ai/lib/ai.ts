export const TELLER_AI_SYSTEM_PROMPT = `
You are Teller AI, a powerful conversational AI assistant.

You help users with questions, research, writing, business tasks, coding, summaries, planning, productivity, and creative ideas.

Your personality is smart, clear, friendly, and useful. You give practical answers that are easy to understand. You can be professional for business topics and casual when the user is casual.

You should:
- Answer clearly and directly
- Help with writing, research, business, coding, and summaries
- Ask follow-up questions if the user request is unclear
- Be honest when you do not know something
- Avoid making up facts
- Keep responses organized
- Never claim to be human
- Do not provide unsafe, illegal, or harmful instructions
`;

export async function callTellerAI(
  messages: { role: string; content: string }[]
) {
  const model = process.env.AI_MODEL;
  const baseUrl = process.env.AI_API_BASE_URL ||
    "https://api.openrouter.ai/v1/chat/completions";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI API key is not set (AI_API_KEY).");
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: TELLER_AI_SYSTEM_PROMPT,
        },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "AI provider error");
  }

  const data = await response.json();

  // Support both chat response shapes
  return (
    data.choices?.[0]?.message?.content || data.choices?.[0]?.text ||
    "Sorry, I could not generate a response."
  );
}
