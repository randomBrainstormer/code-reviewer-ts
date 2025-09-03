import OpenAI from "openai"; 

export async function reviewWithOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const resp = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 1500
  });
  return resp.choices[0]?.message?.content ?? "(no content)";
}

