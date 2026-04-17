import { NextRequest, NextResponse } from "next/server";

const FASTROUTER_BASE_URL = "https://api.fastrouter.ai/api/v1";
const MODEL = "google/gemini-3.1-flash-lite-preview";

const SYSTEM_PROMPT = `You are a clinical nutrition AI assistant. You will receive a photo of food.
Your task is to identify every distinct food item visible and estimate its nutritional content.

You MUST respond with ONLY a valid JSON array — no markdown, no explanation, no preamble.
Each element in the array must follow this exact schema:
{
  "name": "<food name>",
  "quantity": "<serving description, e.g. '1 cup', '2 slices', '150g'>",
  "calories": <integer kcal>,
  "protein": <integer grams>,
  "carbs": <integer grams>,
  "fats": <integer grams>
}

Rules:
- List every distinct food item visible as a separate object.
- Use realistic, evidence-based nutritional estimates (USDA or similar).
- If you cannot identify any food in the image, return an empty array: []
- Do NOT include any text outside the JSON array.`;

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = await req.json();

    if (!imageDataUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.FASTROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FastRouter API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${FASTROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify all food items in this image and return the JSON array only.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl, // data:image/<type>;base64,... URL from FileReader/canvas
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("FastRouter error:", err);
      return NextResponse.json(
        { error: `FastRouter API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";

    // Strip accidental markdown code fences
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    let parsed: any[];
    try {
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON response", raw },
        { status: 502 }
      );
    }

    // Attach client-side compatible ids
    const entries = parsed.map((item: any) => ({
      id: Math.random().toString(36).slice(2),
      name: item.name ?? "Unknown",
      quantity: item.quantity ?? "",
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fats: Number(item.fats) || 0,
    }));

    return NextResponse.json(entries);
  } catch (err: any) {
    console.error("Food detect error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
